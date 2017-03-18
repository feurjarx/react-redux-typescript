import * as React from "react";
import TextField from 'material-ui/TextField';

const Range = (props) => (
    <div>
        <TextField
            style={ inputStyle }
            hintText="От"
            floatingLabelFixed={true}
            floatingLabelText="Диапазон"
        />
        <TextField
            style={ inputStyle }
            hintText="До"
        />
    </div>
);

export default Range;

const inputStyle = {
    width: 100
};