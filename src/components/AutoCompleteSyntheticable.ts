import * as React from "react";
import * as ReactDOM from "react-dom";
import AutoComplete from 'material-ui/AutoComplete';

export class AutoCompleteSyntheticable extends AutoComplete {
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

    handleItemTouchTap = (event, child)  => {

        const dataSource = this.props.dataSource;
        const index = parseInt(child.key, 10);
        const chosenRequest = dataSource[index];
        const searchText = this['chosenRequestText'](chosenRequest);

        this.setState({
            searchText: searchText,
        }, () => {

            const onUpdateInputCall = this.props['onUpdateInput'] as any;
            onUpdateInputCall(searchText, this.props.dataSource, this.input);

            this['timerTouchTapCloseId'] = setTimeout(() => {
                this['timerTouchTapCloseId'] = null;
                this['close']();
                this.props.onNewRequest(chosenRequest, index);
            }, this.props.menuCloseDelay);
        });
    };
}

export default AutoCompleteSyntheticable;