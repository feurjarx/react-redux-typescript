import * as React from "react";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';
import AutoComplete from "../../../components/AutoCompleteSyntheticable";

export class FieldForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    typesSource = [{
        text: 'Строковый',
        value: 'string'
    }, {
        text: 'Числовой',
        value: 'integer'
    }];

    render() {

        const {typesSource} = this;

        const {
            idx,
            total,
            onCheck,
            tableIdx,
            primaryIdx,
            onReplicaAdd,
            defaultValues,
            onReplicaRemove,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        return (
            <ReplicaTools
                onReplicaAdd={onReplicaAdd}
                onReplicaRemove={onReplicaRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper className="flex-row" style={{padding: 10, marginBottom: 10, marginLeft: 1}}>
                    <div>
                        <TextField
                            style={{width: 175}}
                            hintText="Введите имя поля"
                            name={`tables.${tableIdx}.fields.${idx}.name`}
                            onChange={onTextFieldChange}
                            defaultValue={defaultValues.name}
                        />

                        <TextField
                            style={{width: 175}}
                            hintText="Макс. размер"
                            name={`tables.${tableIdx}.fields.${idx}.length`}
                            onChange={onTextFieldChange}
                            defaultValue={defaultValues.length}
                        />

                        <AutoComplete
                            style={{width: null}}
                            textFieldStyle={{width: 175}}
                            openOnFocus={true}
                            filter={AutoComplete.noFilter}
                            hintText="Укажите тип данных"
                            dataSource={typesSource}
                            name={`tables.${tableIdx}.fields.${idx}.type`}
                            onUpdateInput={ onAutoCompleteUpdate }
                        />
                    </div>
                    <div className="flex-column" style={{justifyContent: 'flex-end'}}>
                        <span className="gray">Индексы</span>
                        <Checkbox
                            disabled={primaryIdx !== idx && primaryIdx !== null}
                            onCheck={onCheck.bind(null, {isPrimary: true, idx})}
                            name={`tables.${tableIdx}.fields.${idx}.isPrimary`}
                            label="первичный"
                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                        />
                        <Checkbox
                            disabled={primaryIdx === idx}
                            name={`tables.${tableIdx}.fields.${idx}.indexed`}
                            className="data-struct-external-index-checkbox"
                            onCheck={onCheck.bind(null, {isPrimary: false})}
                            label="внешний"
                            labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                        />
                    </div>
                </Paper>
            </ReplicaTools>
        )
    }
}