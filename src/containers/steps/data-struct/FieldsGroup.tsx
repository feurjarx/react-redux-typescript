import * as React from "react";

import {FieldForm} from "./FieldForm";

class FieldsGroup extends React.Component<any, any> {

    constructor(props) {
        super(props);

        this.state = {
            replics: [],
            primaryIdx: null
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

    onReplicaAdd = () => {

        const {
            replics,
            primaryIdx
        } = this.state;

        const {
            // onCheck,
            tableIdx,
            defaultFieldData,
            onTextFieldChange,
            onAutoCompleteUpdate
        } = this.props;

        const {onCheck} = this;

        replics.push(
            <FieldForm
                primaryIdx={primaryIdx}
                total={replics.length}
                key={replics.length}
                idx={replics.length}
                tableIdx={tableIdx}
                onTextFieldChange={onTextFieldChange}
                onAutoCompleteUpdate={onAutoCompleteUpdate}
                onCheck={onCheck}
                onReplicaAdd={this.onReplicaAdd}
                onReplicaRemove={this.onReplicaRemove}
                defaultValues={defaultFieldData}
            />
        );

        this.setState({replics});
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

    componentDidUpdate = () => {
        const fieldsList = this.refs['fieldsList'] as HTMLElement;
        fieldsList.scrollTop = fieldsList.scrollHeight;
    };

    render() {

        const {replics, primaryIdx} = this.state;
        const total = replics.length;

        return (
            <div ref="fieldsList" style={{overflowY: 'auto', height: 130}}>
                {replics.map(r => React.cloneElement(r, {total, primaryIdx}))}
            </div>
        )
    }
}

export default FieldsGroup;