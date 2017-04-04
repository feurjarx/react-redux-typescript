import * as React from "react";

import {FieldForm} from "./FieldForm";

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

    onReplicaAdd = () => {

        const {
            replics,
            primaryIdx,
            familiesSource
        } = this.state;

        const {
            // onCheck,
            tableIdx,
            defaultFieldData,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

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
                onReplicaAdd={this.onReplicaAdd}
                onReplicaRemove={this.onReplicaRemove}
                defaultValues={defaultFieldData}
            />
        );

        this.setState({replics}, () => this.scrollToBottom());
    };

    onReplicaRemove = () => {
        const {replics} = this.state;
        const {tableIdx, onFieldRemove} = this.props;
        replics.pop();

        this.setState({replics}, () => {
            if (onFieldRemove) {
                onFieldRemove(tableIdx);
            }
        });
    };

    componentWillMount() {
        this.onReplicaAdd();
    }

    scrollToBottom() {
        const fieldsList = this.refs['fieldsList'] as HTMLElement;
        fieldsList.scrollTop = fieldsList.scrollHeight;
    };

    render() {

        const {replics, primaryIdx, familiesSource} = this.state;
        const total = replics.length;

        return (
            <div ref="fieldsList" style={{overflowY: 'auto', height: 160}}>
                {replics.map(r => React.cloneElement(r, {total, primaryIdx, familiesSource}))}
            </div>
        )
    }
}