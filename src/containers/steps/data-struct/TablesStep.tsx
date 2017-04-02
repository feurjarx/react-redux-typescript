import * as React from "react";
import {connect} from "react-redux";

import {updateOtherStepsData} from "../../../actions/index";
import FormDataService from "../../../services/FormData";
import {TableForm} from "./TableForm";

@connect()
class TablesStep extends React.Component<any, any> {

    fds: FormDataService;

    getDefaultTableData() {
        return {
            name: 'user',
            fields: [{
                name: null,
                type: null
            }]
        }
    };

    constructor(props) {
        super(props);

        const {formDataService} = props;
        formDataService.setData({ tables: [] });
        this.fds = formDataService;

        this.state = {
            replics: []
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

        const {replics} = this.state;
        const total = replics.length;

        return (
            <div className="flex-row justify-center">
                {replics.map(r => React.cloneElement(r, {total}))}
            </div>
        )
    }
}

export default TablesStep;