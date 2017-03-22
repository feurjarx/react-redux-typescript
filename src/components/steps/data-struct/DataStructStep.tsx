import * as React from "react";
import "./data-struct-step.css";
import styles from "./data-struct-step.styles";
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField'
// import AutoComplete from 'material-ui/AutoComplete'
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

    primaryCheckHandle = (event, checked) => {
        event.currentTarget
            .closest('.data-struct-index-paper')
            .querySelector('.data-struct-external-index-checkbox')
            .querySelector('input')
            .disabled = checked;

        this.handleFormChange(event);
    };


    onTableAdd = (index) => {

        const {formDs, defaultStepData} = this;

        const form = this.refs['dataStructFormNode'] as HTMLFormElement;
        const newPaperElem = form.querySelectorAll('.data-struct-table-paper')[index];
        [].map.call(newPaperElem.querySelectorAll('[name]'), elem => {
            if (elem.name) {
                elem.name = formDs.getIncrementedPath(elem.name, 'tables');
            }
        });

        const formData = formDs.data;
        formData.tables.push(defaultStepData.tables[0]);
        formDs.setData(formData);
    };

    onBeforeTableAdd = (index, cmp) => {
        //cmp.props.body.props.children.props.children[1].props.children.props.children[0].props.children[1].props.name
    };

    onTableRemove = (index) => {
        const {formDs } = this;

        const formData = formDs.data;
        formData.tables.pop();
        formDs.setData(formData);
    };

    handleFormChange = (event) => {
        const { target } = event;
        const { formDs } = this;

        if (target.name) {
            formDs.setDataByPath(target.name, target.value);
        }
    };

    onAutoCompleteUpdate = (name, value) => {
        const { formDs, typeByTextMap } = this;
        formDs.setDataByPath(name, typeByTextMap[value]);
    };

    autocomplets = [];

    render() {

        const {
            onAutoCompleteUpdate,
            handleFormChange,
            onBeforeTableAdd,
            onTableRemove,
            autocomplets,
            typesSource,
            onTableAdd,
            formDs
        } = this;

        return (

            <form onChange={handleFormChange} ref="dataStructFormNode">
                <DesignReplicator
                    styles={ styles.tables }
                    onReplicaAdd={ onTableAdd }
                    onReplicaRemove={ onTableRemove }
                    onBeforeReplicaAdd={ onBeforeTableAdd }
                >
                    <div>
                        <Paper className="data-struct-table-paper">
                            <TextField
                                name="tables.0.name"
                                defaultValue="my_table"
                                floatingLabelText="Введите имя таблицы"
                                fullWidth={true}
                            />

                            <DesignReplicator styles={ styles.fields }>
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
                                        />


                                    </div>
                                    <div className="data-struct-index-paper">
                                        <span className="gray">Индексы</span>
                                        <Checkbox
                                            onCheck={this.primaryCheckHandle}
                                            label="первичный"
                                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                                        />
                                        <Checkbox
                                            className="data-struct-external-index-checkbox"
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

/*
 <AutoComplete
 openOnFocus={true}
 filter={AutoComplete.noFilter}
 hintText="Укажите тип данных"
 dataSource={typesSource}
 style={styles.fields.autocompleteField}
 onUpdateInput={ function(value) {
 debugger
 autocomplets;
 onAutoCompleteUpdate(this.name, value);
 }}
 name="tables.0.fields.0.type"
 />
 */