import * as React from "react";
import {Step, StepLabel} from 'material-ui/Stepper';
import {Dialog, FlatButton, RaisedButton} from 'material-ui';

import {initConnection, sendDataToServer} from '../../actions/socket.io'

import initial from '../../configs/frontend-data'

import './preparing.css';

import {connect} from "react-redux";

import HorizontalLinearStepper from "../../components/stepper/HorizontalLinearStepper";
import RequestsStep from "../steps/RequestsStep";
import HardwareStep from "../steps/hardware-settings/HardwareStep";
import FormDataService from "../../services/FormDataService";
import {prettylog} from "../../helpers/index";
import TablesStep from "../steps/data-struct/TablesStep";

class Preparing extends React.Component<any, any> {

    fds: FormDataService;

    constructor() {
        super();

        this.state = {
            open: false
        };

        this.fds = new FormDataService();
    }

    componentDidMount() {
        this.props.initConnection('http://localhost:3003');
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

        this.props.start(fds.data);

        this.handleClose();

        localStorage.setItem('initial', JSON.stringify(fds.data));
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

        const steps = [
            <HardwareStep formDataService={fds}/>,
            <TablesStep formDataService={fds}/>,
            <RequestsStep formDataService={fds} />,
        ];

        prettylog(fds.data);

        return (

            <div>
                <RaisedButton
                    className={this.props.activated ? 'hidden' : ''}
                    label="Запустить модель"
                    primary={true}
                    onTouchTap={this.handleOpen}
                />
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

function mapDispatchToProps(dispatch) {
    return {
        initConnection: (url) => dispatch(initConnection(url)),
        start: (fdsData) => dispatch(sendDataToServer(fdsData))
    }
}

function mapStateToProps(state, props) {
    return {
        activated: state.processActivated
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Preparing);

const dialogStyles = {
    content: {
        width: '100%',
        maxWidth: 'none'
    },
    title: {
        textAlign: 'center'
    }
};
