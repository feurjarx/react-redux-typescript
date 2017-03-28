import * as React from "react";
import {prettylog} from "../../../helpers/index";

import FormDataService from "../../../services/FormData";
import {updateOtherStepsData} from "../../../actions/index";
import {connect} from "react-redux";
import HardwareForm from './HardwareForm'

import "./hardware-settings-step.css"

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

        prettylog(fds.data);
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

        prettylog(fds.data);
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

export default HardwareSettingsStep;