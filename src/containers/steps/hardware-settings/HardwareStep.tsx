import * as React from "react";

import FormDataService from "../../../services/FormData";
import {updateOtherStepsData} from "../../../actions/index";
import {connect} from "react-redux";
import HardwareForm from './HardwareForm'

@connect()
class HardwareStep extends React.Component<any, any> {

    fds: FormDataService;

    getDefaultServerData() {
        return {
            name: 'my_server',
            hdd: 1000,
            replicationNumber: 0,
            pDie: 1,
            distanceToMaster: 25,
            isMaster: false,
            maxRegions: 10
        }
    };

    constructor(props) {
        super(props);

        const {formDataService} = props;
        formDataService.setData({ servers: [] });
        this.fds = formDataService;

        this.state = {
            replics: [],
            masterIdx: null
        }
    }

    onServerAdd = () => {

        const {replics} = this.state;
        const {getDefaultServerData} = this;

        replics.push(
            <HardwareForm
                total={replics.length}
                key={replics.length}
                idx={replics.length}
                onCheckHandle={this.onCheckHandle}
                onSliderUpdate={this.onSliderUpdate}
                onTextFieldChange={this.onTextFieldChange}
                onServerAdd={this.onServerAdd}
                onServerRemove={this.onServerRemove}
                defaultValues={getDefaultServerData()}
            />
        );

        this.setState({replics}, () => {
            const {fds, dispatchServersData} = this;
            fds.data['servers'].push(getDefaultServerData());
            dispatchServersData();
        });
    };

    onServerRemove = () => {
        const {replics} = this.state;
        let {masterIdx} = this.state;

        const lastIdx = replics.length - 1;
        replics.pop();

        if (lastIdx === masterIdx) {
            masterIdx = null;
        }

        this.setState({replics, masterIdx}, () => {
            const {fds, dispatchServersData} = this;
            fds.data['servers'].pop();
            dispatchServersData();
        });
    };

    onTextFieldChange = (event) => {
        const {target} = event;
        const {fds, dispatchServersData} = this;

        if (target.name) {
            fds.setDataByPath(target.name, target.value);
        }

        dispatchServersData();
    };

    dispatchServersData = () => {
        const {fds} = this;
        this.props.dispatch(updateOtherStepsData({
            servers: fds.data.servers
        }));
    };

    onCheckHandle = (event, checked) => {

        const idx = +event.target.value;
        const checkboxElem = event.currentTarget;

        this.setState({masterIdx: checked ? idx : null}, () => {

            const {fds, dispatchServersData} = this;
            fds.setDataByPath(checkboxElem.name, checked);

            dispatchServersData();
        });
    };

    onSliderUpdate = (v: number, name: string) => {
        const {fds, dispatchServersData} = this;

        if (name) {
            fds.setDataByPath(name, v);
        }

        dispatchServersData();
    };

    componentWillMount() {
        this.onServerAdd();
    }

    render() {

        const {replics, masterIdx} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row justify-center">
                {replics.map(r => React.cloneElement(r, {total, masterIdx}))}
            </div>
        )
    }
}

export default HardwareStep;