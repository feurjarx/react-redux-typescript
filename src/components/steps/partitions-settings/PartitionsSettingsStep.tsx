import * as React from "react";
import "./partitions-settings-step.css";

import styles from "./partitions-settings-step.style";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';

import {DesignReplicator} from '../../design-replicator/DesignReplicator';

import Range from "../../range-field/RangeField";
import MultiCheckboxesField from "../../multi-checkboxes-field/MultiCheckboxesField";
import FormDataService from "../../../services/FormData";

class PartitionsSettingsStep extends React.Component<any, any> {

    formDs: FormDataService;

    defaultStepData = {
        segments: [{
            path: null,
            criteria: null,
            servers: []
        }]
    };

    constructor() {
        super();

        const {defaultStepData} = this;
        this.formDs = new FormDataService(defaultStepData);
    }

    handleFormChange = (event) => {
        const { target } = event;
        const { formDs } = this;

        if (target.name) {
            formDs.setDataByPath(target.name, target.value);
        }

        console.log('***');
        console.log(`%c${ JSON.stringify(formDs.data, null, 2) }`, 'color: green; font-weight: bold');
    };

    render() {

        const items = [{
            text: 'Сервер А',
            value: 2
        }, {
            text: 'Сервер Б',
            value: 3
        }, {
            text: 'Сервер C',
            value: 4
        }];

        const {
            handleFormChange,

        } = this;

        return (

            <form onChange={handleFormChange}>
                <DesignReplicator
                    hint="segments"
                    styles={styles}
                >
                    <div>
                        <Paper className="partitions-settings-paper">
                            {/*
                            <AutoComplete
                                openOnFocus={true}
                                filter={AutoComplete.noFilter}
                                floatingLabelText="Укажите поле таблицы"
                                dataSource={[]}
                            />
                            */}
                            <TextField
                                name="segments.0.path"
                                floatingLabelText="Укажите поле таблицы"
                            />

                            {/*<Range />*/}

                            <TextField
                                name="segments.0.criteria"
                                floatingLabelFixed={true}
                                floatingLabelText="Критерия сегмента"
                                hintText="Например, $ > 0 and $ <> 1"
                            />

                            <MultiCheckboxesField labelText="Укажите сервера" items={items}/>


                        </Paper>
                    </div>

                </DesignReplicator>
            </form>
        )
    }
}

export default PartitionsSettingsStep;