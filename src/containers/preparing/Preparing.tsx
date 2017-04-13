import * as React from "react";
// const socket = {on: new Function(), emit: new Function()};
import * as io from 'socket.io-client';
const socket = io.connect('http://localhost:3003');

import {Step, StepLabel} from 'material-ui/Stepper';
import {Dialog, FlatButton, RaisedButton} from 'material-ui';

import initial from '../../configs/frontend-mock-data'

import './preparing.css';

import {connect} from "react-redux";

import {
    EVENT_IO_LIFE,
    EVENT_IO_LOGS,
    EVENT_IO_PRELIFE,
    EVENT_IO_THE_END,
    EVENT_IO_DISCONNECT
} from "../../constants/events";

import {
    pushNewItemsToSlavesLoadChart,
    pushNewItemToRequestsDiagram,
    pushLogsBatchToConsoleDrawer,
    updateRegionsPiesCharts,
    initChartsData,
    startStopwatch,
    stopStopwatch
} from "../../actions/index";

import HorizontalLinearStepper from "../../components/stepper/HorizontalLinearStepper";
import RequestsStep from "../steps/RequestsStep";
import HardwareStep from "../steps/hardware-settings/HardwareStep";
import FormDataService from "../../services/FormDataService";
import PartitionsStep from "../steps/partitions-settings/PartitionsStep";
import {prettylog} from "../../helpers/index";
import TablesStep from "../steps/data-struct/TablesStep";
import {CHART_TYPE_REQUESTS_DIAGRAM, CHART_TYPE_SLAVES_LOAD} from "../../constants/index";

@connect()
export class Preparing extends React.Component<any, any> {

    fds: FormDataService;

    constructor() {
        super();

        this.state = {
            open: false,
            active: false
        };

        this.fds = new FormDataService();
    }

    componentDidMount() {
        // socket.on('connect', function () {});
        socket.on(EVENT_IO_LIFE, this.onLifeUpdate);
        socket.on(EVENT_IO_PRELIFE, this.onBigDataResponse);
        socket.on(EVENT_IO_LOGS, this.onConsoleDrawerUpdate);
        socket.on(EVENT_IO_THE_END, this.onLifeComplete);
        socket.on(EVENT_IO_DISCONNECT, () => {
            this.props.dispatch(stopStopwatch());
        });
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

        const {nClients, requestsLimit} = fdsData;
        const servers = initial.servers.filter(s => !s['isMaster']);
        // const servers = fdsData.servers.filter(s => !s.isMaster);

        dispatch(initChartsData({
            serversIds: servers.map(s => s.name),
            requestsDiagramMaxValue: (+requestsLimit * +nClients) * 2
        }));

        const clients = [];
        for (let i = 0; i < nClients; i++) {
            const nRequests = Math.round(Math.random() * +requestsLimit) || 1;
            clients.push({nRequests});
        }

        socket.emit(EVENT_IO_LIFE, {
            ...initial,
            // ...fdsData,
            clients,
            requestsLimit
        });

        dispatch(startStopwatch());

        this.handleClose();

        this.setState({active: true});
    };

    onBigDataResponse = (data) => {
        this.props.dispatch(updateRegionsPiesCharts(data));
    };

    onLifeUpdate = (data, type) => {
        const {dispatch} = this.props;
        switch (type) {
            case CHART_TYPE_REQUESTS_DIAGRAM:
                dispatch(pushNewItemToRequestsDiagram(data));
                break;
            case CHART_TYPE_SLAVES_LOAD:
                dispatch(pushNewItemsToSlavesLoadChart(data));
                break;
            default:
                throw new Error('Unknown life data type');
        }
    };

    onConsoleDrawerUpdate = (logsJson) => {
        this.props.dispatch(pushLogsBatchToConsoleDrawer(logsJson));
    };

    onLifeComplete = () => {
        const { dispatch } =  this.props;
        dispatch(stopStopwatch());
        this.setState({active: false});
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

        const {fds} = this;

        // <PartitionsStep formDataService={fds}/>,
        const steps = [
            <HardwareStep formDataService={fds}/>,
            <TablesStep formDataService={fds}/>,
            <RequestsStep formDataService={fds} />,
        ];

        prettylog(fds.data);

        return (

            <div>

                <RaisedButton className={this.state.active ? 'hidden' : ''} label="Запустить модель" primary={true} onTouchTap={this.handleOpen} />
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