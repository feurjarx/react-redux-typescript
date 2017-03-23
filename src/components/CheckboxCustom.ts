import * as ReactDOM from "react-dom";
import Checkbox from 'material-ui/Checkbox';

export class CheckboxCustom extends Checkbox {
    constructor(props) {
        super(props);
    }

    props: any;

    input: HTMLInputElement;

    componentDidMount() {

        const templateName = this.props.name;

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = templateName;
        this.input = hiddenInput;

        ReactDOM.findDOMNode(this).appendChild(hiddenInput);
    }
}

export default CheckboxCustom;