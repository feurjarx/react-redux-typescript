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

    logs = [];
    showLimit = 50;

    constructor() {
        super();

        this.state = {
            open: false,
            showLogs: [],
            scrollLocked: false,
            connected: false
        }
    }

    handleToggle = () => {
        this.setState({open: !this.state.open})
    };

    onRequestChange = (open) => {
        this.setState({open});
    };

    componentWillReceiveProps(props) {
        const {logsJson, stopwatch} = props;

        if (stopwatch === 'start' && !this.state.connected) {
            this.logs = [];
            this.setState({connected: true});
        }

        if (stopwatch === 'stop' && this.state.connected) {
            this.setState({connected: false});
        }

        if (logsJson) {

            const newLogs = JSON.parse(logsJson);
            this.logs = this.logs.concat(newLogs);

            this.setState({
                showLogs: this.getShowLogs()
            });
        }
    }

    getShowLogs() {
        const {showLimit, logs} = this;
        let showLogs = logs;
        if (this.logs.length > showLimit) {
            showLogs = logs.slice((-1) * showLimit);
        }

        return showLogs;
    }

    componentWillUpdate() {
        const scrollerElem = this.refs['logsScroller'] as HTMLElement;
        scrollerElem.scrollTop = scrollerElem.scrollHeight;
    }

    onLogsScroll = () => {

        const {open, scrollLocked, connected} = this.state;
        if (open && !connected && !scrollLocked) {

            const scrollerElem = this.refs['logsScroller'] as HTMLElement;

            const {logs} = this;
            let {showLogs} = this.state;

            const logsLength = logs.length;
            const showLogsLength = showLogs.length;

            if (scrollerElem.scrollTop === 0 && logsLength > showLogsLength) {
                this.setState({scrollLocked: true}, () => {

                    const {showLimit} = this;
                    showLogs = logs.slice((-1) * (showLimit + showLogsLength));

                    this.setState({showLogs, scrollLocked: false})
                });
            }
        }
    };

    render() {

        const {open, showLogs} = this.state;

        const {
            onRequestChange,
            handleToggle,
            onLogsScroll,
            logs
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

        const labelText = `Консоль событий ${logs.length ? '(' + logs.length + ')' : ''}`;

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
                    {/*
                     onScroll={onLogsScroll}
                    */}
                    <div style={contentStyle}
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