import * as React from "react";

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';
import FieldsGroup from "./FieldsGroup";
import AutoComplete from "../../../components/AutoCompleteSyntheticable";
import {composition} from "../../../helpers/index";
import {
SHARDING_TYPE_DEFAULT,
SHARDING_TYPE_HORIZONTAL,
SHARDING_TYPE_VERTICAL
} from "../../../constants/index";

export default class TableForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    shardingTypesSource = [
        SHARDING_TYPE_DEFAULT,
        SHARDING_TYPE_HORIZONTAL,
        SHARDING_TYPE_VERTICAL
    ];

    constructor(props) {
        super(props);

        this.state = {
            fieldsSource: [],
            shardingType: SHARDING_TYPE_DEFAULT
        }
    }

    onShardingTypeUpdate = (shardingType) => {
        this.setState({shardingType})
    };

    onShardedFieldUpdate = () => {
        const formData = this.props.formDataService.data;
        const {idx} = this.props;

        const {fields} = formData.tables[idx];

        this.setState({
            fieldsSource: fields.map(f => f.name)
        });
    };

    componentWillReceiveProps(props) {
        const {defaultValues} = props;
        if (defaultValues && defaultValues.sharding && defaultValues.sharding.type) {
            this.setState({
                shardingType: defaultValues.sharding.type
            });
        }
    }

    render() {

        const {
            idx,
            total,
            onCheck,
            onTableAdd,
            defaultValues,
            onFieldRemove,
            onTableRemove,
            serversSource,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        const {shardingType, fieldsSource} = this.state;

        let serverId, fieldName;
        if (defaultValues.sharding) {
            serverId = defaultValues.sharding.serverId;
            fieldName = defaultValues.sharding.fieldName;
        }

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        let shardAutoComplete: JSX.Element;
        if (shardingType === SHARDING_TYPE_VERTICAL) {
            shardAutoComplete = (
                <AutoComplete
                    style={{width: null, marginLeft: 10}}
                    textFieldStyle={{width: 175}}
                    openOnFocus={true}
                    filter={AutoComplete.noFilter}
                    floatingLabelText="Укажите сервер"
                    dataSource={serversSource}
                    name={`tables.${idx}.sharding.serverId`}
                    onUpdateInput={ onAutoCompleteUpdate }
                    searchText={serverId}
                    listStyle={{overflowY: 'auto', maxHeight: 100}}
                />
            );
            // name={`tables.${idx}.sharding.slaveId`}
        }

        let shardedFieldAutoComplete: JSX.Element;
        if (shardingType === SHARDING_TYPE_HORIZONTAL) {
            shardedFieldAutoComplete = (
                <AutoComplete
                    style={{width: null, marginLeft: 10}}
                    textFieldStyle={{width: 175}}
                    openOnFocus={true}
                    filter={AutoComplete.noFilter}
                    floatingLabelText="Укажите поле"
                    dataSource={fieldsSource}
                    name={`tables.${idx}.sharding.fieldName`}
                    onFocus={this.onShardedFieldUpdate}
                    onUpdateInput={onAutoCompleteUpdate}
                    searchText={fieldName}
                    listStyle={{overflowY: 'auto', maxHeight: 100}}
                />
            );
        }

        return (
            <ReplicaTools
                onReplicaAdd={onTableAdd}
                onReplicaRemove={onTableRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper style={paperStyle} zDepth={3}>
                    <TextField
                        name={`tables.${idx}.name`}
                        defaultValue={defaultValues.name}
                        floatingLabelText="Наименование таблицы"
                        fullWidth={true}
                        onChange={onTextFieldChange}
                    />

                    <TextField
                        name={`tables.${idx}.tableSize`}
                        defaultValue={defaultValues.tableSize}
                        floatingLabelText="Размер пространства"
                        fullWidth={true}
                        onChange={onTextFieldChange}
                    />

                    <FieldsGroup
                        tableIdx={idx}
                        onTextFieldChange={onTextFieldChange}
                        onAutoCompleteUpdate={onAutoCompleteUpdate}
                        onFieldRemove={onFieldRemove}
                        onCheck={onCheck}
                        defaultFieldsData={defaultValues.fields}
                    />

                    <AutoComplete
                        style={{width: null}}
                        textFieldStyle={{width: 185}}
                        openOnFocus={true}
                        filter={AutoComplete.noFilter}
                        floatingLabelText="Тип шардинга"
                        dataSource={this.shardingTypesSource}
                        name={`tables.${idx}.sharding.type`}
                        onUpdateInput={ composition(this.onShardingTypeUpdate, onAutoCompleteUpdate) }
                        searchText={shardingType}
                    />

                    {shardAutoComplete}

                    {shardedFieldAutoComplete}
                </Paper>
            </ReplicaTools>
        );
    }
}

const paperStyle = {
    width: 400,
    height: 300,
    padding: 10,
    overflowY: 'auto'
};