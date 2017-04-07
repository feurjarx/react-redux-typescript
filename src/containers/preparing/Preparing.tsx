import * as React from "react";
// const socket = {on: new Function(), emit: new Function()};
import * as io from 'socket.io-client';
const socket = io.connect('http://localhost:3003');

import {Step, StepLabel} from 'material-ui/Stepper';
import {Dialog, FlatButton, RaisedButton} from 'material-ui';

import initial from './../../configs/default-data'

import './preparing.css';

import {connect} from "react-redux";

import {
    EVENT_IO_LIFE,
    EVENT_IO_THE_END,
    EVENT_IO_LOAD_LINE, EVENT_IO_DISCONNECT, EVENT_IO_PRELIFE
} from "../../constants/events";

import {
    pushNewItemToRequestsDiagram,
    updateRegionsPiesCharts,
    initRequestsDiagram,
    startStopwatch,
    updateCpuChart,
    stopStopwatch
} from "../../actions/index";

import HorizontalLinearStepper from "../../components/stepper/HorizontalLinearStepper";
import RequestsStep from "../steps/RequestsStep";
import HardwareStep from "../steps/hardware-settings/HardwareStep";
import FormDataService from "../../services/FormDataService";
import PartitionsStep from "../steps/partitions-settings/PartitionsStep";
import {prettylog} from "../../helpers/index";
import TablesStep from "../steps/data-struct/TablesStep";
import {inherits} from "util";

@connect()
export class Preparing extends React.Component<any, React.ComponentState> {

    fds: FormDataService;

    state = {
        open: false,
    };

    constructor(props) {
        super();

        // socket.on('connect', function () {});
        socket.on(EVENT_IO_LIFE, this.onLifeUpdate);
        socket.on(EVENT_IO_PRELIFE, this.onBigDataResponse);
        socket.on(EVENT_IO_THE_END, this.onLifeComplete);
        socket.on(EVENT_IO_DISCONNECT, function () {
            props.dispatch(stopStopwatch());
        });

        socket.on(EVENT_IO_LOAD_LINE, this.onLoadLineUpdate);

        this.fds = new FormDataService();
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

        const {fds} = this;
        const {dispatch} = this.props;
        const fdsData = fds.data;

        // const {nClients, servers, requestsLimit} = fdsData;
        const {nClients, requestsLimit} = fdsData;
        const servers = initial.servers.filter(s => !s['isMaster']);

        dispatch(initRequestsDiagram({
            nServers: servers.length,
            serversIds: servers.map(s => s.name),
            maxValue: +requestsLimit * +nClients + 5
        }));

        const clients = [];
        for (let i = 0; i < nClients; i++) {
            const nRequests = Math.round(Math.random() * +requestsLimit) || 1;
            clients.push({nRequests});
        }

        socket.emit(EVENT_IO_LIFE, {
            ...initial,
            clients
        });

        dispatch(startStopwatch());

        this.handleClose();
    };

    onBigDataResponse = (data) => {
        this.props.dispatch(updateRegionsPiesCharts(data));
    };

    onLoadLineUpdate = (data) => {
        this.props.dispatch(updateCpuChart(data));
    };

    onLifeUpdate = (data) => {
        // console.count(`onLifeUpdate ${Date.now() / 1000}`);
        this.props.dispatch(pushNewItemToRequestsDiagram(data));
    };

    onLifeComplete = () => {
        const { dispatch } =  this.props;
        dispatch(stopStopwatch());
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

        const { fds } = this;

        const steps = [
            <HardwareStep formDataService={fds}/>,
            <TablesStep formDataService={fds}/>,
            <PartitionsStep formDataService={fds}/>,
            <RequestsStep formDataService={fds} />,
        ];

        prettylog(fds.data);

        return (

            <div>

                <RaisedButton label="Запустить модель" primary={true} onTouchTap={this.handleOpen} />
                <Dialog
                    title="Подготовка запуска"
                    actions={ actions }
                    modal={ false }
                    open={ this.state.open }
                    onRequestClose={ this.handleClose }
                    contentStyle={dialogStyles.content}
                    bodyClassName="preparing-modal-body"
                    titleStyle={dialogStyles.title}
                >
                    <HorizontalLinearStepper steps={steps}>
                        <Step>
                            <StepLabel>Аппаратная конфигурация</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Структура хранения данных</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Партиционирование данных</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Эксперимент</StepLabel>
                        </Step>
                    </HorizontalLinearStepper>
                </Dialog>
            </div>
        )
    }
}

const dialogStyles = {
    content: {
        width: '100%',
        maxWidth: 'none'
    },
    title: {
        textAlign: 'center'
    }
};