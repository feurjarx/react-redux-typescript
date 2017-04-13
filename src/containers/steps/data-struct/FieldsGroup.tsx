import * as React from "react";

import {FieldForm} from "./FieldForm";
import {composition} from "../../../helpers";

export default class FieldsGroup extends React.Component<any, any> {

    constructor(props) {
        super(props);

        this.state = {
            replics: [],
            primaryIdx: null,
            familiesSource: []
        }
    }

    onCheck = ({isPrimary, idx}, event, checked) => {
        if (isPrimary) {
            if (checked) {
                this.setState({
                    primaryIdx: idx
                });

            } else {

                this.setState({
                    primaryIdx: null
                });
            }
        }

        this.props.onCheck(event, checked);
    };

    onUpdateFamiliesSource = (familyName) => {
        let {familiesSource} = this.state;
        familiesSource.push(familyName);
        familiesSource = familiesSource
            .filter((it, i) => familiesSource.indexOf(it) === i && it);

        this.setState({familiesSource})
    };

    onFieldAdd = (fieldData = null) => {

        const {
            replics,
            primaryIdx,
            familiesSource
        } = this.state;

        const {
            tableIdx,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        if (!fieldData) {
            fieldData = this.props.defaultFieldsData[0];
        }

        const {onCheck, onUpdateFamiliesSource} = this;

        replics.push(
            <FieldForm
                primaryIdx={primaryIdx}
                total={replics.length}
                key={replics.length}
                idx={replics.length}
                tableIdx={tableIdx}
                onTextFieldChange={onTextFieldChange}
                onAutoCompleteUpdate={onAutoCompleteUpdate}
                familiesSource={familiesSource}
                onUpdateFamiliesSource={onUpdateFamiliesSource}
                onCheck={onCheck}
                onFieldAdd={this.onFieldAdd}
                onFieldRemove={this.onFieldRemove}
                defaultValues={fieldData}
            />
        );

        this.setState({replics});
    };

    onFieldRemove = () => {
        const {replics} = this.state;
        const {tableIdx, onFieldRemove} = this.props;
        replics.pop();

        this.setState({replics}, () => {
            if (onFieldRemove) {
                onFieldRemove(tableIdx);
            }
        });
    };

    componentDidMount() {
        this.props.defaultFieldsData.forEach(tableData => {
            this.onFieldAdd(tableData);
        });
    }

    render() {

        const {replics, primaryIdx, familiesSource} = this.state;
        const total = replics.length;

        return (
            <div>
                {replics.map(r => React.cloneElement(r, {total, primaryIdx, familiesSource}))}
            </div>
        )
    }
}