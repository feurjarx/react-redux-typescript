import * as React from "react";
import lifeConfig from "../../configs/life";
import socketConfig from "../../configs/socket.io"
const socket = require('socket.io-client')(socketConfig.host);
const syntaxConfig = require('./../../configs/syntax.json');

import {
    Step,
    StepLabel,
} from 'material-ui/Stepper';

import {
    Dialog,
    FlatButton,
    RaisedButton,
} from 'material-ui';

import styles from './preparing.styles';
import './preparing.css';

import {EVENT_IO_LIFE, EVENT_IO_THE_END, EVENT_IO_LOAD_LINE} from "../../constants/events";
import {connect} from "react-redux";
import {updateMonitorItem, initialLifeData, startStopwatch, stopStopwatch, updateCpuChart} from "../../actions/index";
import {DesignReplicator} from "../../components/design-replicator/DesignReplicator";
import HorizontalLinearStepper from "../../components/stepper/HorizontalLinearStepper";
import RequestsSettingsStep from "./steps/RequestsSettingsStep";

@connect()
export class Preparing extends React.Component<any, React.ComponentState> {

    state = {
        open: false,
        nClients: lifeConfig.nClients,
        nServers: lifeConfig.nServers,
        requestsLimit: lifeConfig.requestsLimit,
        requestTimeLimit: lifeConfig.requestTimeLimit,
    };

    constructor(props) {
        super();

        // socket.on('connect', function () {});
        socket.on(EVENT_IO_LIFE, this.receiveLifeResponse);
        socket.on(EVENT_IO_THE_END, this.onCompleteLife);
        socket.on('disconnect', function () {
            props.dispatch(stopStopwatch());
        });

        socket.on(EVENT_IO_LOAD_LINE, this.receiveLoadLineResponse);
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

    receiveLoadLineResponse = (data) => {
        this.props.dispatch(updateCpuChart(data));
    };

    receiveLifeResponse = (data) => {
        this.props.dispatch(updateMonitorItem(data));
    };

    onCompleteLife = () => {

        const { dispatch } =  this.props;

        dispatch(stopStopwatch());
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

    getStepContent = (index) => {

        const {
            handleSlidersChange,
            handleFormChange,
        } = this;

        const {
            requestTimeLimit,
            requestsLimit,
            nClients,
            nServers

        } = this.state;

        const requestsSettingsProps = {
            handleSlidersChange,
            handleFormChange,
            requestTimeLimit,
            requestsLimit,
            nClients,
            nServers
        };

        return [
            <HardwareSettingsStep />,
            <PartitionsSettingsStep />,
            <RequestsSettingsStep { ...requestsSettingsProps }/>
            // ...
        ][index];
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
                    <HorizontalLinearStepper getStepContent={ this.getStepContent }>
                        <Step>
                            <StepLabel>Структура хранения данных</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Аппаратная архитектура</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Сегментация данных</StepLabel>
                        </Step>
                    </HorizontalLinearStepper>
                </Dialog>
            </div>
        );
    }
}

const HardwareSettingsStep = props => {
    return (
        <h1>Hardware</h1>
    );
};

const PartitionsSettingsStep = props => {
    return (
        <h1>Сегментация данных</h1>
    );
};