import * as ReactDOM from "react-dom";
import AutoComplete from 'material-ui/AutoComplete';

export default class AutoCompleteSyntheticable extends AutoComplete {
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

    handleChange = (event) => {
        const searchText = event.target.value;

        if (searchText === this.state['searchText']) {
            return;
        }

        this.setState({
            searchText: searchText,
            open: true,
            anchorEl: ReactDOM.findDOMNode(this.refs['searchTextField'])
        }, function () {
            this.props.onUpdateInput(searchText, this.props.dataSource, this.input);
        });
    }
}
