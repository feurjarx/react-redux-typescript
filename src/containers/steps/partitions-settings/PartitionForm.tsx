import * as React from "react";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';
import AutoComplete from "../../../components/AutoCompleteSyntheticable";
import MultiCheckboxesField from "../../../components/multi-checkboxes-field/MultiCheckboxesField";

export class PartitionForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    render() {

        const {
            idx,
            total,
            onCheck,
            pathSource,
            serversSource,
            defaultValues,
            onPartitionAdd,
            onPartitionRemove,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        return (
            <ReplicaTools
                onReplicaAdd={onPartitionAdd}
                onReplicaRemove={onPartitionRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper style={{width: 300, padding: 10, maxHeight: 260, overflowY: 'auto'}} zDepth={3}>

                    <AutoComplete
                        openOnFocus={true}
                        filter={AutoComplete.noFilter}
                        floatingLabelText="Укажите таблицу и поле "
                        name={`segments.${idx}.path`}
                        dataSource={pathSource}
                        onUpdateInput={onAutoCompleteUpdate}
                    />

                    <TextField
                        defaultValue={defaultValues.criteria}
                        name={`segments.${idx}.criteria`}
                        floatingLabelFixed={true}
                        floatingLabelText="Критерия сегмента"
                        hintText="Например, $ > 0 and $ <> 1"
                        onChange={onTextFieldChange}
                    />

                    <MultiCheckboxesField
                        onCheck={onCheck.bind(null, idx)}
                        labelText="Укажите сервера"
                        items={serversSource}
                    />
                </Paper>
            </ReplicaTools>
        );
    }
}