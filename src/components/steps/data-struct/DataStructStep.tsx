import * as React from "react";
import * as ReactDOM from "react-dom";
import "./data-struct-step.css";
import styles from "./data-struct-step.styles";
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField'
import AutoComplete from '../../AutoCompleteSyntheticable'
import Checkbox from 'material-ui/Checkbox';

import FormDataService from './../../../services/FormData'

import {DesignReplicator} from '../../design-replicator/DesignReplicator';

class DataStructStep extends React.Component<any, any> {

    formDs: FormDataService;

    typesSource = [{
        text: 'Строковый',
        value: 'string'
    }, {
        text: 'Числовой',
        value: 'integer'
    }];

    typeByTextMap = {
        'Строковый': 'string',
        'Числовой': 'integer'
    };

    defaultStepData = {
        tables: [{
            name: '',
            fields: [{
                name: '',
                type: null
            }]
        }]
    };

    constructor() {
        super();

        const {defaultStepData} = this;
        this.formDs = new FormDataService(defaultStepData);
    }


    onTableAdd = (index, replicaBox) => {
        const {formDs, defaultStepData} = this;
        formDs.normalizeElementPath('tables', index, replicaBox);
    };

    onFieldAdd = (index, replicaBox) => {
        const {formDs, defaultStepData} = this;
        formDs.normalizeElementPath('fields', index, replicaBox);
    };

    onTableRemove = () => {
        const {formDs } = this;
        const formData = formDs.data;
        formData.tables.pop();
    };

    handleFormChange = (event) => {
        const { target } = event;
        const { formDs } = this;

        if (target.name) {
            formDs.setDataByPath(target.name, target.value);
        }

        console.log('***');
        console.log(JSON.stringify(formDs.data, null, 2));
    };

    onAutoCompleteUpdate = (value, _, target) => {
        const { formDs, typeByTextMap } = this;
        const name = target['name'];
        formDs.setDataByPath(name, typeByTextMap[value]);

        console.log('***');
        console.log(JSON.stringify(formDs.data, null, 2));
    };

    externalCheckHandle = (event, checked) => {
        event.currentTarget.value = checked;
        this.handleFormChange(event);
    };

    primaryCheckHandle = (event, checked) => {
        event.currentTarget
            .closest('.data-struct-index-paper')
            .querySelector('.data-struct-external-index-checkbox')
            .querySelector('input')
            .disabled = checked;

        event.currentTarget.value = checked;
        this.handleFormChange(event);
    };

    render() {

        const {
            onAutoCompleteUpdate,
            handleFormChange,
            onTableRemove,
            typesSource,
            onTableAdd,
            onFieldAdd
        } = this;

        return (

            <form onChange={handleFormChange}>
                <DesignReplicator
                    styles={ styles.tables }
                    onReplicaAdd={ onTableAdd }
                    onReplicaRemove={ onTableRemove }
                >
                    <div>
                        <Paper className="data-struct-table-paper">
                            <TextField
                                name="tables.0.name"
                                defaultValue="my_table"
                                floatingLabelText="Введите имя таблицы"
                                fullWidth={true}
                            />

                            <DesignReplicator
                                styles={ styles.fields }
                                onReplicaAdd={ onFieldAdd }
                            >
                                <Paper className="data-struct-fields-paper">
                                    <div>
                                        <TextField
                                            hintText="Введите имя поля"
                                            style={styles.fields.textField}
                                            name="tables.0.fields.0.name"
                                        />

                                        <AutoComplete
                                            openOnFocus={true}
                                            filter={AutoComplete.noFilter}
                                            hintText="Укажите тип данных"
                                            dataSource={typesSource}
                                            style={styles.fields.autocompleteField}
                                            name="tables.0.fields.0.type"
                                            onUpdateInput={ onAutoCompleteUpdate }
                                        />

                                    </div>
                                    <div className="data-struct-index-paper">
                                        <span className="gray">Индексы</span>
                                        <Checkbox
                                            name="tables.0.fields.0.isPrimaryIndexed"
                                            onCheck={this.primaryCheckHandle}
                                            label="первичный"
                                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                                        />
                                        <Checkbox
                                            name="tables.0.fields.0.isExternalIndexed"
                                            className="data-struct-external-index-checkbox"
                                            onCheck={this.externalCheckHandle}
                                            label="внешний"
                                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                                        />
                                    </div>
                                </Paper>
                            </DesignReplicator>
                        </Paper>
                    </div>
                </DesignReplicator>
            </form>
        )
    }
}

export default DataStructStep;
