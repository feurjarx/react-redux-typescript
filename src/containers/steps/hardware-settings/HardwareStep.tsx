import * as React from "react";

import "./hardware-settings-step.css"
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

import InfoSlider from "../../../components/info-slider/InfoSlider";
import FormDataService from "../../../services/FormData";
import {updateOtherStepsData} from "../../../actions/index";
import {connect} from "react-redux";
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';
import {pipe} from './../../../helpers/index';

@connect()
class HardwareSettingsStep extends React.Component<any, any> {

    fds: FormDataService;

    get defaultServerData() {
        return {
            name: 'my_server',
            hdd: 1000,
            replicationNumber: 0,
            pDie: 1,
            distanceToMaster: 25,
            isMaster: false
        }
    };

    constructor(props) {
        super(props);

        const {formDataService} = props;
        formDataService.setData({
            servers: []
        });
        this.fds = formDataService;

        this.state = {
            replics: []
        }
    }

    onReplicaAdd = () => {

        const {replics} = this.state;
        replics.push(
            <HardwareForm
                total={replics.length}
                key={replics.length}
                idx={replics.length}
                onCheckHandle={this.onCheckHandle}
                onSliderUpdate={this.onSliderUpdate}
                onTextFieldChange={this.handleFormChange}
                onReplicaAdd={this.onReplicaAdd}
                onReplicaRemove={this.onReplicaRemove}
                defaultValues={this.defaultServerData}
            />
        );

        this.setState({replics});
        const {fds, defaultServerData} = this;
        fds.data['servers'].push(defaultServerData);
    };

    onReplicaRemove = () => {
        const {replics} = this.state;
        replics.pop();
        this.setState({replics});

        const {fds} = this;
        fds.data['servers'].pop();
    };

    handleFormChange = (event) => {
        const {target} = event;
        const {fds} = this;

        if (target.name) {
            fds.setDataByPath(target.name, target.value);
        }

        this.props.dispatch(updateOtherStepsData({
            servers: fds.data.servers
        }));

        console.log('***');
        console.log(`%c${ JSON.stringify(fds.data, null, 2) }`, 'color: black; font-weight: bold');
        console.log('***');
    };

    onCheckHandle = (event, checked) => {
        event.target.value = checked;
        this.handleFormChange(event);
    };

    onSliderUpdate = (v: number, name: string) => {
        const {fds} = this;

        if (name) {
            fds.setDataByPath(name, v);
        }

        console.log('***');
        console.log(`%c${ JSON.stringify(fds.data, null, 2) }`, 'color: green; font-weight: bold');
        console.log('***');
    };

    componentWillMount() {
        this.onReplicaAdd();
    }

    render() {

        const {replics} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row justify-center">
                {replics.map(r => React.cloneElement(r, {total}))}
            </div>
        )
    }
}

class HardwareForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            sliderDisabled: false
        }
    }

    onCheckHandle = (event, checked) => {
        this.setState({
            sliderDisabled: checked
        })
    };

    render() {

        const {
            idx,
            total,
            onReplicaAdd,
            onCheckHandle,
            onSliderUpdate,
            onReplicaRemove,
            onTextFieldChange,
            defaultValues
        } = this.props;

        const {sliderDisabled} = this.state;

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        return (
            <ReplicaTools
                onReplicaAdd={onReplicaAdd}
                onReplicaRemove={onReplicaRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper className="hardware-settings-paper">
                    <TextField
                        defaultValue={defaultValues.name}
                        name={`servers.${idx}.name`}
                        floatingLabelText="Введите имя сервера"
                        onChange={onTextFieldChange}
                    />

                    <InfoSlider
                        label="Доступное пространство"
                        name={`servers.${idx}.hdd`}
                        shortSyntax='Гб'
                        min={2}
                        max={2000}
                        step={1}
                        defaultValue={defaultValues.hdd}
                        onChange={onSliderUpdate}
                    />

                    <InfoSlider
                        defaultValue={defaultValues.replicationNumber}
                        label="Кол-во репликаций"
                        name={`servers.${idx}.replicationNumber`}
                        shortSyntax=""
                        max={3}
                        step={1}
                        onChange={onSliderUpdate}
                    />

                    <InfoSlider
                        defaultValue={defaultValues.pDie}
                        label="Вероятность отказа"
                        name={`servers.${idx}.pDie`}
                        shortSyntax="%"
                        min={0.1}
                        max={100}
                        step={0.1}
                        onChange={onSliderUpdate}
                    />

                    <InfoSlider
                        defaultValue={defaultValues.distanceToMaster}
                        label="Расстояние до master-сервера"
                        name={`servers.${idx}.distanceToMaster`}
                        shortSyntax='км'
                        min={0}
                        max={25000}
                        step={0.1}
                        disabled={sliderDisabled}
                        onChange={onSliderUpdate}
                    />

                    <Checkbox
                        defaultChecked={defaultValues.isMaster}
                        onCheck={pipe(onCheckHandle, this.onCheckHandle)}
                        label="Master"
                        name={`servers.${idx}.isMaster`}
                        labelStyle={{color: 'rgba(0, 0, 0, 0.3)'}}
                    />
                </Paper>
            </ReplicaTools>
        );
    }
}

export default HardwareSettingsStep;