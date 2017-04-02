import * as React from "react";

import FormDataService from "../../../services/FormData";

import {PartitionForm} from './PartitionForm';
import {connect} from "react-redux";
import {prettylog} from "../../../helpers/index";

function mapStateToProps(state, props) {
    return state;
}

class PartitionsStepConnectable extends React.Component<any, any> {

    fds: FormDataService;

    getDefaultSegmentData() {
        return {
            path: '',
            criteria: '',
            servers: []
        }
    };

    constructor(props) {
        super();

        const {formDataService} = props;
        formDataService.setData({
            segments: []
        });

        this.fds = formDataService;

        this.state = {
            replics: [],
            pathSource: [],
            serversSource: []
        };
    }

    onPartitionAdd = () => {

        const {getDefaultSegmentData} = this;
        const {replics, serversSource, pathSource} = this.state;
        replics.push(
            <PartitionForm
                key={replics.length}
                idx={replics.length}
                total={replics.length}
                serversSource={serversSource}
                pathSource={pathSource}
                onAutoCompleteUpdate={this.onAutoCompleteUpdate}
                onTextFieldChange={this.onTextFieldChange}
                onPartitionAdd={this.onPartitionAdd}
                onPartitionRemove={this.onPartitionRemove}
                onCheck={this.onCheck}
                defaultValues={getDefaultSegmentData()}
            />
        );

        this.setState({replics}, () => {
            const {fds} = this;
            fds.data['segments'].push(getDefaultSegmentData());
        });
    };

    onPartitionRemove = () => {
        const {replics} = this.state;
        replics.pop();

        this.setState({replics}, () => {
            const {fds} = this;
            fds.data['segments'].pop();
        });
    };

    onTextFieldChange = (event) => {
        const { fds } = this;
        const { target } = event;
        if (target.name) {
            fds.setDataByPath(target.name, target.value);
        }
    };

    onAutoCompleteUpdate = (value, _, target) => {
        const {fds} = this;
        const name = target['name'];
        fds.setDataByPath(name, value);
    };

    onCheck = (segmentIdx, event, checked) => {
        const {fds} = this;
        let {servers} = fds.data.segments[segmentIdx];
        const checkedServerName = event.currentTarget.value;
        if (checked) {
            servers.push(checkedServerName);
            servers = servers.filter((s,i) => servers.indexOf(s) === i);
        } else {
            servers = servers.filter((s,i) => s !== checkedServerName);
            fds.data.segments[segmentIdx].servers = servers;
        }

        prettylog(fds.data);
    };

    componentWillMount() {
        this.onPartitionAdd();
    }

    componentWillReceiveProps(props) {

        let {otherStepsData} = props;
        if (otherStepsData) {
            const {tables} = otherStepsData;
            if (tables) {
                let pathSource = [];
                tables.forEach(t => {
                    t.fields.forEach(f => {
                        pathSource.push(t.name + '/' + f.name,);
                    });
                });

                this.setState({pathSource});
            }

            const {servers} = otherStepsData;
            if (servers) {
                const serversSource = servers.map(s => ({
                    text: s.name,
                    value: s.name
                }));
                this.setState({serversSource});
            }
        }
    }

    render() {

        const {replics, pathSource, serversSource} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row justify-center">
                {replics.map(r => React.cloneElement(r, {total, pathSource, serversSource}))}
            </div>
        )
    }
}

export default connect(mapStateToProps)(PartitionsStepConnectable);