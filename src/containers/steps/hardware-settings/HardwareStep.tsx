import * as React from "react";

import FormDataService from "../../../services/FormDataService";
import {updateOtherStepsData} from "../../../actions/index";
import {connect} from "react-redux";
import HardwareForm from './HardwareForm'
import initial from "./../../../configs/frontend-data";

class HardwareStep extends React.Component<any, any> {

    fds: FormDataService;

    getDefaultServerData() {
        return {
            name: 'server_A',
            hdd: 1000,
            replicationNumber: 0,
            pDie: 1,
            distanceToMasterKm: 25,
            isMaster: false,
            maxRegions: 5
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

    addServer(serverData = null) {
        if (!serverData) {
            serverData = this.getDefaultServerData();
        }

        const {replics} = this.state;

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
                defaultValues={serverData}
            />
        );

        this.setState({replics}, () => {
            const {fds} = this;
            fds.data['servers'].push(serverData);
            this.props.share(fds.data.servers);
        });
    }

    onServerAdd = () => {
        this.addServer();
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
            const {fds} = this;
            fds.data['servers'].pop();
            this.props.share(fds.data.servers);
        });
    };

    onTextFieldChange = (event) => {
        const {target} = event;
        const {fds} = this;

        if (target.name) {
            fds.setDataByPath(target.name, target.value);
        }

        this.props.share(fds.data.servers);
    };

    onCheckHandle = (event, checked) => {

        const idx = +event.target.value;
        const checkboxElem = event.currentTarget;

        this.setState({masterIdx: checked ? idx : null}, () => {

            const {fds} = this;
            fds.setDataByPath(checkboxElem.name, checked);
            this.props.share(fds.data.servers);
        });
    };

    onSliderUpdate = (v: number, name: string) => {
        const {fds} = this;

        if (name) {
            fds.setDataByPath(name, v);
        }

        this.props.share(fds.data.servers);
    };

    componentDidMount() {

        const {servers} = initial;
        if (servers) {
            servers.forEach(serverData => {
                this.addServer(serverData);
            });

        } else {
            this.addServer();
        }
    }

    render() {

        const {replics, masterIdx} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row">
                {replics.map(r => React.cloneElement(r, {total, masterIdx}))}
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        share: (servers) => dispatch(updateOtherStepsData({servers}))
    }
}

function mapStateToProps(state, props) {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(HardwareStep);