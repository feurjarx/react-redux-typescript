import * as React from "react";
const socket = require('socket.io-client')('http://localhost:3003');

import {

    TextField,
    Dialog,
    FlatButton,
    RaisedButton

} from 'material-ui';

import styles from './preparing.styles';

import Ref = React.Ref;

import { EVENT_IO_LIFE } from "../../constants/events";

export class Preparing extends React.Component<any, React.ComponentState> {

    state = {
        open: false,
    };

    constructor() {
        super();

        // socket.on('connect', function () {});

        // socket.on('myevent', function () {
        //     debugger
        // });

        // socket.on('disconnect', function () {});
    }

    handleOpen = () => {
        this.setState({
            open: true
        });
    };

    handleClose = () => {
        this.setState({
            open: false
        });
    };

    handleRunning = () => {
        if (this.state) {
            socket.emit(EVENT_IO_LIFE, this.state);
            this.handleClose();
        }
    };

    handleFormChange = (event) => {
        const { target } = event;
        this.setState({
            [target.name]: target.value
        })
    };

    render() {

        const actions = [
            <FlatButton
                label="Начать"
                primary={true}
                keyboardFocused={true}
                onTouchTap={ this.handleRunning }
            />,
            <FlatButton
                label="Закрыть"
                onTouchTap={this.handleClose}
            />
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
                    contentStyle={styles.dialog.content}
                    bodyStyle={styles.dialog.body}
                    titleStyle={styles.dialog.title}
                >

                    <form onChange={ this.handleFormChange }>

                        <TextField
                            name="nClients"
                            floatingLabelText="Введите количество клиентов"
                        />

                        <TextField
                            name="nServers"
                            floatingLabelText="Введите количество серверов"
                        />
                    </form>
                </Dialog>
            </div>
        );
    }
}