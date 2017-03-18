import * as React from "react";
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

export interface MultiCheckboxesFieldProps {
    items: Array<{
        text: string;
        value: any;
        checked?: boolean;
    }>;
    labelText: string;
    name?: string;
}

class MultiCheckboxesField extends React.Component<MultiCheckboxesFieldProps, any> {
    constructor() {
        super();
    }

    render() {

        const {
            labelText,
            name = '',
            items
        } = this.props;

        const checkboxes = items.map((it,i) => (
            <Checkbox
                key={i}
                labelStyle={{color: 'rgba(0, 0, 0, 0.298039)'}}
                defaultChecked={it.checked}
                label={it.text}
            />
        ));

        return (
            <div>
                <span className="gray">{ labelText }</span>
                { checkboxes }
            </div>
        )
    }
}

export default MultiCheckboxesField;