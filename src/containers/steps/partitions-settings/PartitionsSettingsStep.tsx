import * as React from "react";
import "./partitions-settings-step.css";

import styles from "./partitions-settings-step.style";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import AutoComplete from '../../../components/AutoCompleteSyntheticable';

import {DesignReplicator} from '../../../components/design-replicator/DesignReplicator';

import MultiCheckboxesField from "../../../components/multi-checkboxes-field/MultiCheckboxesField";
import FormDataService from "../../../services/FormData";
import {connect} from "react-redux";

function mapStateToProps(state, props) {
    return state;
}

class PartitionsSettingsStepConnectable extends React.Component<any, any> {

    fds: FormDataService;

    defaultStepData = {
        segments: [{
            path: null,
            criteria: null,
            servers: []
        }]
    };

    state = {
        pathSource: [],
        serversSource: []
    };

    constructor(props) {
        super();

        const {defaultStepData} = this;
        const {formDataService} = props;
        formDataService.setData(defaultStepData);
        this.fds = formDataService;
    }

    handleFormChange = (event) => {
        const { fds } = this;

        const { target } = event;
        if (target.name) {
            fds.setDataByPath(target.name, target.value);
        }

        console.log('***');
        console.log(`%c${ JSON.stringify(fds.data, null, 2) }`, 'color: green; font-weight: bold');
    };

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

    onAutoCompleteUpdate = (value, _, target) => {
        const {fds} = this;
        const name = target['name'];
        fds.setDataByPath(name, value);
    };

    render() {

        const {
            onAutoCompleteUpdate,
            handleFormChange
        } = this;

        const { pathSource, serversSource } = this.state;

        return (

            <form onChange={handleFormChange}>
                <DesignReplicator
                    hint="segments"
                    styles={styles}
                >
                    <div>
                        <Paper className="partitions-settings-paper" zDepth={3}>

                            <AutoComplete
                                openOnFocus={true}
                                filter={AutoComplete.noFilter}
                                floatingLabelText="Укажите таблицу и поле "
                                name="segments.0.path"
                                dataSource={pathSource}
                                onUpdateInput={onAutoCompleteUpdate}
                            />

                            <TextField
                                name="segments.0.criteria"
                                floatingLabelFixed={true}
                                floatingLabelText="Критерия сегмента"
                                hintText="Например, $ > 0 and $ <> 1"
                            />

                            <MultiCheckboxesField labelText="Укажите сервера" items={serversSource}/>
                        </Paper>
                    </div>

                </DesignReplicator>
            </form>
        )
    }
}

export const PartitionsSettingsStep = connect(mapStateToProps)(PartitionsSettingsStepConnectable);