import * as React from "react";

import {

    TextField,
    Dialog,
    FlatButton,
    RaisedButton,
    DatePicker

} from 'material-ui';

export class Preparing extends React.Component<any, React.ComponentState> {

    state = {
        open: false,
    };

    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    constructor() {
        super();
    }

    render() {

        const actions = [
            <FlatButton
                label="Ok"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClose}
            />,
        ];

        return (
            <div>
                <RaisedButton label="Запустить модель" primary={true} onTouchTap={this.handleOpen} />
                <Dialog
                    title="Подготовка запуска"
                    actions={ actions }
                    modal={ false }
                    open={ this.state.open }
                    onRequestClose={ this.handleClose }
                >

                    <DatePicker hintText="Date Picker" />

                    <TextField floatingLabelText="Введите количество клиентов"/>

                    <TextField floatingLabelText="Введите количество серверов"/>

                </Dialog>
            </div>
        );
    }
}
