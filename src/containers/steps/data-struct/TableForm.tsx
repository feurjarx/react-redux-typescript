import * as React from "react";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';
import FieldsGroup from "./FieldsGroup";
import InfoSlider from "../../../components/info-slider/InfoSlider";

export class TableForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    render() {

        const {
            idx,
            total,
            onCheck,
            onTableAdd,
            defaultValues,
            onFieldRemove,
            onTableRemove,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        return (
            <ReplicaTools
                onReplicaAdd={onTableAdd}
                onReplicaRemove={onTableRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper style={{width: 400, height: 260, padding: 10}} zDepth={3}>
                    <TextField
                        name={`tables.${idx}.name`}
                        defaultValue={defaultValues.name}
                        hintText="Введите имя таблицы"
                        fullWidth={true}
                        onChange={onTextFieldChange}
                    />

                    <TextField
                        name={`tables.${idx}.tableSize`}
                        defaultValue={defaultValues.tableSize}
                        hintText="Укажите размер таблицы"
                        fullWidth={true}
                        onChange={onTextFieldChange}
                    />

                    <FieldsGroup
                        tableIdx={idx}
                        onTextFieldChange={onTextFieldChange}
                        onAutoCompleteUpdate={onAutoCompleteUpdate}
                        onFieldRemove={onFieldRemove}
                        onCheck={onCheck}
                        defaultFieldData={{...defaultValues.fields[0]}}
                    />
                </Paper>
            </ReplicaTools>
        );
    }
}