import * as React from "react";
import * as ReactDOM from "react-dom";

import "./hardware-settings-step.css"
import styles from "./hardware-settings-step.style";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

import {DesignReplicator} from '../../../components/design-replicator/DesignReplicator';
import InfoSlider from "../../../components/info-slider/InfoSlider";
import FormDataService from "../../../services/FormData";
import {updateOtherStepsData} from "../../../actions/index";
import {connect} from "react-redux";

@connect()
class HardwareSettingsStep extends React.Component<any, any> {

    fds: FormDataService;

    defaultStepData = {
        servers: [{
            name: '',
            hdd: null,
            replicationNumber: 0,
            pDie: 0,
            isMaster: false
        }]
    };

    constructor(props) {
        super();

        const {defaultStepData} = this;
        const {formDataService} = props;
        formDataService.setData(defaultStepData);
        this.fds = formDataService;
    }

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
        console.log(`%c${ JSON.stringify(fds.data, null, 2) }`, 'color: green; font-weight: bold');
    };

    onCheckHandle = (event, checked) => {

        // const inputBlockElem = ReactDOM
        //     .findDOMNode(this.refs['paper'])
        //     .querySelector('[name$="distanceToMaster"]')
        //     .closest('.flex-column');

        // if (checked) {
        //     inputBlockElem.classList.add('hidden');
        // } else {
        //     inputBlockElem.classList.remove('hidden');
        // }

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

    render() {

        const {
            handleFormChange,
            onSliderUpdate,
            onCheckHandle,
            fds
        } = this;

        const onReplicaRemove = fds.removeArrayElem.bind(fds);

        return (
            <form onChange={handleFormChange}>

                <DesignReplicator
                    hint="servers"
                    styles={styles}
                    onReplicaRemove={ onReplicaRemove }
                >
                    <div>
                        <Paper className="hardware-settings-paper" ref="paper">
                            <TextField
                                name="servers.0.name"
                                floatingLabelText="Введите имя сервера"
                            />

                            <InfoSlider
                                label="Доступное пространство"
                                name="servers.0.hdd"
                                shortSyntax='Гб'
                                min={2}
                                max={2000}
                                step={1}
                                onChange={onSliderUpdate}
                            />

                            <InfoSlider
                                label="Кол-во репликаций"
                                name="servers.0.replicationNumber"
                                shortSyntax=""
                                max={3}
                                step={1}
                                onChange={onSliderUpdate}
                            />

                            <InfoSlider
                                label="Вероятность отказа"
                                name="servers.0.pDie"
                                shortSyntax="%"
                                min={0.1}
                                max={100}
                                step={0.1}
                                onChange={onSliderUpdate}
                            />

                            <InfoSlider
                                label="Расстояние до master-сервера"
                                name="servers.0.distanceToMaster"
                                shortSyntax='км'
                                min={0}
                                max={25000}
                                step={0.1}
                                onChange={onSliderUpdate}
                            />

                            <Checkbox
                                onCheck={onCheckHandle}
                                label="Master"
                                name="servers.0.isMaster"
                                labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                            />
                        </Paper>
                    </div>
                </DesignReplicator>
            </form>
        )
    }
}

export default HardwareSettingsStep;