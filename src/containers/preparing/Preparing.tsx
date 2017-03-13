import * as React from "react";
import lifeConfig from "../../configs/life";

const socket = require('socket.io-client')('http://localhost:3003');
const syntaxConfig = require('./../../configs/syntax.json');

import {

    TextField,
    Dialog,
    FlatButton,
    RaisedButton,

} from 'material-ui';

import InfoSlider from '../../components/info-slider/InfoSlider';

import styles from './preparing.styles';
import './preparing.css';

import {EVENT_IO_LIFE, EVENT_IO_THE_END} from "../../constants/events";
import {connect} from "react-redux";
import {updateMonitorItem, initialLifeData, stopMonitor, startStopwatch, stopStopwatch} from "../../actions/index";

@connect()
export class Preparing extends React.Component<any, React.ComponentState> {

    state = {
        open: false,
        nClients: lifeConfig.nClients,
        nServers: lifeConfig.nServers,
        requestsLimit: lifeConfig.requestsLimit,
        requestTimeLimit: lifeConfig.requestTimeLimit,
    };

    constructor() {
        super();

        // socket.on('connect', function () {});
        socket.on(EVENT_IO_LIFE, this.receiveLifeResponse);
        socket.on(EVENT_IO_THE_END, this.onCompleteLife);
        // socket.on('disconnect', function () {});
    }

    handleOpen = () => {
        const open = true;
        this.setState({ open });
    };

    handleClose = () => {
        const open = false;
        this.setState({ open });
    };

    handleRunning = () => {

        if (this.state) {

            const { dispatch } = this.props;

            dispatch(initialLifeData(this.state));

            const clients = [];
            for (let i = 0; i < this.state.nClients; i++) {
                const requestsNumber = Math.round(Math.random() * +this.state.requestsLimit) || 1;
                clients.push({ requestsNumber });
            }

            socket.emit(EVENT_IO_LIFE, {
                ...this.state,
                clients
            });

            dispatch(startStopwatch());

            this.handleClose();
        }
    };

    receiveLifeResponse = (data) => {
        this.props.dispatch(updateMonitorItem(data));
    };

    onCompleteLife = () => {

        const { dispatch } =  this.props;

        dispatch(stopStopwatch());
        dispatch(stopMonitor());
    };

    handleFormChange = (event) => {
        const { target } = event;
        this.setState({
            [target.name]: target.value
        })
    };

    handleSlidersChange = (v: number, name: string) => {
        this.setState({
            [name]: v
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
                    <form onChange={ this.handleFormChange } id="life-data-form">

                        <div id="clients-settings-block" className="v-internal-interval-10">

                            <InfoSlider
                                name="nClients"
                                syntax={syntaxConfig['client']}
                                min={1}
                                defaultValue={ this.state.nClients }
                                onChange={ this.handleSlidersChange }
                            />

                            <InfoSlider
                                label="Лимит клиента"
                                name="requestsLimit"
                                syntax={syntaxConfig['request']}
                                min={1}
                                defaultValue={ this.state.requestsLimit }
                                onChange={ this.handleSlidersChange }
                            />

                            <InfoSlider
                                label="Лимит сложности запроса"
                                name="requestTimeLimit"
                                shortSyntax="мс"
                                min={1}
                                max={10000}
                                defaultValue={ this.state.requestTimeLimit }
                                onChange={ this.handleSlidersChange }
                            />
                        </div>

                        <div id="servers-settings-block">
                            <InfoSlider
                                name="nServers"
                                syntax={syntaxConfig['server']}
                                min={1}
                                max={10}
                                defaultValue={ this.state.nServers }
                                onChange={ this.handleSlidersChange }
                            />
                        </div>
                    </form>
                </Dialog>
            </div>
        );
    }
}