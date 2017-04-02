import * as React from "react";
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

export interface MultiCheckboxesFieldProps {
    items: Array<{
        text: string;
        value: any;
        checked?: boolean;
    }>;
    segmentIdx?: number;
    labelText: string;
    name?: string;
    onCheck?(...args);
}

class MultiCheckboxesField extends React.Component<MultiCheckboxesFieldProps, any> {

    render() {

        const {
            items,
            onCheck,
            labelText,
        } = this.props;

        const checkboxes = items.map((it,i) => (
            <Checkbox
                onCheck={onCheck}
                key={i}
                labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                defaultChecked={it.checked}
                label={it.text}
                value={it.value}
            />
        ));

        return (
            <div>
                <span className="gray">{ checkboxes.length ? labelText : ''}</span>
                { checkboxes }
            </div>
        )
    }
}

export default MultiCheckboxesField;