import * as React from "react";
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import {connect} from "react-redux";

function mapStateToProps(state) {
    const {logsJson} = state.logsInfo;
    const {stopwatch} = state;

    return {
        logsJson,
        stopwatch
    };
}

class LogsDrawer extends React.Component<any, any> {

    showLimit = 50;

    logs = [];
    connected = false;
    scrollLocked = false;

    constructor() {
        super();

        this.state = {
            open: false,
            showLogs: []
        }
    }

    handleToggle = () => {
        this.setState({open: !this.state.open})
    };

    onRequestChange = (open) => {
        this.setState({open});
    };

    componentWillReceiveProps(nextProps) {
        const {logsJson, stopwatch} = nextProps;

        let {showLogs} = this.state;

        let connected = this.connected;

        if (stopwatch === 'start' && !this.connected) {
            this.logs = [];
            connected = true;
        }

        if (stopwatch === 'stop' && this.connected) {
            connected = false;
        }

        if (logsJson) {
            const newLogs = JSON.parse(logsJson);
            this.logs = this.logs.concat(newLogs);
            showLogs = this.getShowLogs();
        }

        this.setState({showLogs}, () => this.connected = connected);
    }

    getShowLogs() {
        const {showLimit} = this;
        let showLogs = this.logs;
        if (this.logs.length > showLimit) {
            showLogs = this.logs.slice((-1) * showLimit);
        }

        return showLogs;
    }

    componentWillUpdate() {
        const scrollerElem = this.refs['logsScroller'] as HTMLElement;
        scrollerElem.scrollTop = scrollerElem.scrollHeight;
    }

    onLogsScroll = () => {

        const {open} = this.state;

        if (open && !this.connected && !this.scrollLocked) {

            let {showLogs} = this.state;
            const scrollerElem = this.refs['logsScroller'] as HTMLElement;

            const logsLength = this.logs.length;
            const showLogsLength = showLogs.length;

            if (scrollerElem.scrollTop === 0 && logsLength > showLogsLength) {

                this.scrollLocked = true;

                showLogs = this.logs.slice((-1) * (this.showLimit + showLogsLength));

                this.setState(
                    {showLogs},
                    () => this.scrollLocked = false
                );
            }
        }
    };

    render() {

        const {open, showLogs} = this.state;

        const {
            onRequestChange,
            handleToggle,
            onLogsScroll
        } = this;

        let content;
        if (showLogs.length) {
            content = showLogs.map((text, i) => (
                <p style={logItemStyle} key={i}>{text}</p>
            ));
        } else {
            content = (
                <p style={logItemStyle}>Событий нет</p>
            );
        }

        const labelText = `Консоль событий ${this.logs.length ? '(' + this.logs.length + ')' : ''}`;

        return (
            <div>
                <RaisedButton
                    label={labelText}
                    onTouchTap={handleToggle}
                />
                <Drawer
                    containerStyle={{overflow: 'hidden'}}
                    docked={false}
                    width={500}
                    open={open}
                    onRequestChange={onRequestChange}
                >
                    <div
                        style={contentStyle}
                        ref="logsScroller"
                        onScroll={onLogsScroll}
                    >
                        {content}
                    </div>
                </Drawer>
            </div>
        )
    }
}

const contentStyle = {
    backgroundColor: 'black',
    padding: 10,
    minHeight: '100%',
    height: 'auto',
    border: '2px solid white',
    overflowY: 'auto',
    maxHeight: '100%'
};

const logItemStyle = {
    fontSize: 'x-small',
    margin: 0,
    color: 'rgb(0, 187, 0)',
    padding: '3px 0'
};

export default connect(mapStateToProps)(LogsDrawer);