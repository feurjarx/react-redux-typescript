import * as React from "react";
import {connect} from "react-redux";

import {updateOtherStepsData} from "../../../actions/index";
import FormDataService from "../../../services/FormDataService";
import TableForm from "./TableForm";
import {SHARDING_TYPE_DEFAULT, FIELD_TYPE_NUMBER} from "../../../constants/index";

function mapStateToProps(state, props) {
    const {servers} = state.otherStepsData;

    return {
        servers
    };
}


class TablesStep extends React.Component<any, any> {

    fds: FormDataService;

    getDefaultTableData() {
        return {
            name: 'user',
            tableSize: null,
            sharding: {
                type: SHARDING_TYPE_DEFAULT
            },
            fields: [{
                name: 'id',
                type: FIELD_TYPE_NUMBER,
                familyName: null
            }]
        }
    };

    constructor(props) {
        super(props);

        const {formDataService} = props;
        formDataService.setData({ tables: [] });
        this.fds = formDataService;

        this.state = {
            replics: [],
            serversSource: []
        }
    }

    componentWillReceiveProps(props) {
        let {servers} = props;
        if (servers) {
            const serversSource = servers
                .filter(s => !s.isMaster)
                .map(s => ({
                    text: s.name,
                    value: s.name
                }));

            this.setState({serversSource});
        }
    }

    onAutoCompleteUpdate = (value, _, target) => {
        const {fds} = this;
        const name = target.name;
        fds.setDataByPath(name, value);
    };

    onTableAdd = () => {

        const {replics} = this.state;
        const {getDefaultTableData} = this;

        replics.push(
            <TableForm
                formDataService={this.fds}
                total={replics.length}
                key={replics.length}
                idx={replics.length}
                onCheck={this.onCheck}
                onTextFieldChange={this.onTextFieldChange}
                onAutoCompleteUpdate={this.onAutoCompleteUpdate}
                onTableAdd={this.onTableAdd}
                onTableRemove={this.onTableRemove}
                onFieldRemove={this.onFieldRemove}
                defaultValues={getDefaultTableData()}
            />
        );

        this.setState({replics}, () => {
            const {fds, dispatchTablesData} = this;
            fds.data.tables.push(getDefaultTableData());
            dispatchTablesData();
        });
    };

    onTableRemove = () => {
        const {replics} = this.state;
        replics.pop();

        this.setState({replics}, () => {
            const {fds, dispatchTablesData} = this;
            fds.data.tables.pop();
            dispatchTablesData();
        });
    };

    onFieldRemove = (tableIdx) => {
        const {fds, dispatchTablesData} = this;
        fds.data.tables[tableIdx].fields.pop();
        dispatchTablesData();
    };

    onTextFieldChange = (event) => {
        const {name, value} = event.currentTarget;
        const {fds, dispatchTablesData} = this;
        fds.setDataByPath(name, value);
        dispatchTablesData();
    };

    dispatchTablesData = () => {
        const {fds} = this;
        const {tables} = fds.data;
        this.props.dispatch(updateOtherStepsData({tables}));
    };

    onCheck = (event, checked) => {
        const checkboxElem = event.currentTarget;
        const {fds, dispatchTablesData} = this;
        fds.setDataByPath(checkboxElem.name, checked);
        dispatchTablesData();
    };

    componentWillMount() {
        this.onTableAdd();
    }

    render() {

        const {replics, serversSource} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row">
                {replics.map(r => React.cloneElement(r, {total, serversSource}))}
            </div>
        )
    }
}

export default connect(mapStateToProps)(TablesStep);