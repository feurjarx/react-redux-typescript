import * as React from "react";
import AutoComplete from 'material-ui/AutoComplete';

export class AutoCompleteSyntheticable extends AutoComplete {
    constructor(props) {
        super(props);
        debugger
    }

    handleItemTouchTap = (event, child)  => {
        debugger

        const dataSource = this.props.dataSource;

        const index = parseInt(child.key, 10);
        const chosenRequest = dataSource[index];
        const searchText = super['chosenRequestText'](chosenRequest);

        this.setState({
            searchText: searchText,
        }, () => {

            const onUpdateInputCall = this.props['onUpdateInput'] as any;
            onUpdateInputCall(searchText, this.props.dataSource, {
                source: 'touchTap',
            });

            super['timerTouchTapCloseId'] = setTimeout(() => {
                super['timerTouchTapCloseId'] = null;
                super['close']();
                this.props.onNewRequest(chosenRequest, index);
            }, this.props.menuCloseDelay);
        });
    }

}

export default AutoCompleteSyntheticable;