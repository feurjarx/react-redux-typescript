import * as React from "react";
const socket = {on: new Function(), emit: new Function()};

import {Step, StepLabel} from 'material-ui/Stepper';
import {Dialog, FlatButton, RaisedButton} from 'material-ui';

import styles from './preparing.styles';
import './preparing.css';

import {connect} from "react-redux";

import {
    EVENT_IO_LIFE,
    EVENT_IO_THE_END,
    EVENT_IO_LOAD_LINE
} from "../../constants/events";

import {
    stopStopwatch,
    startStopwatch,
    updateCpuChart,
    initialLifeData,
    updateMonitorItem,
} from "../../actions/index";

import HorizontalLinearStepper from "../../components/stepper/HorizontalLinearStepper";
import RequestsStep from "../steps/RequestsStep";
import HardwareStep from "../steps/hardware-settings/HardwareStep";
import FormDataService from "../../services/FormData";
import PartitionsStep from "../steps/partitions-settings/PartitionsStep";
import {prettylog} from "../../helpers/index";
import TablesStep from "../steps/data-struct/TablesStep";

@connect()
export class Preparing extends React.Component<any, React.ComponentState> {

    fds: FormDataService;

    state = {
        open: false,
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

        dispatch(initialLifeData(this.state));

        const {nClients, requestsLimit} = fds.data;
        const clients = [];
        for (let i = 0; i < nClients; i++) {
            const requestsNumber = Math.round(Math.random() * +requestsLimit) || 1;
            clients.push({ requestsNumber });
        }

        socket.emit(EVENT_IO_LIFE, {
            ...this.state,
            clients
        });

        dispatch(startStopwatch());

        this.handleClose();
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
                    contentStyle={styles.dialog.content}
                    bodyStyle={styles.dialog.body}
                    bodyClassName="preparing-modal-body"
                    titleStyle={styles.dialog.title}
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