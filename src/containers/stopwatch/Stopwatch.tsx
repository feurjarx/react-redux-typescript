import * as React from "react";
import {connect} from "react-redux";
import Timer = NodeJS.Timer;

function mapStateToProps(state, props) {
    return state;
}

class Stopwatch extends React.Component<any, any> {

    state = {
        stopped: true,
        time: 0
    };

    private timerId;

    constructor() {
        super();
    }

    start = () => {

        if (this.state.stopped) {

            this.reset();

            this.timerId = setInterval(() => {

                let { time } = this.state;
                time += 10;

                this.setState({ time });

            }, 10);

            this.setState({
                stopped: false
            });
        }
    };

    reset = () => {
        this.setState({
            time: 0
        });
    };

    stop = () => {
        if (!this.state.stopped) {
            clearInterval(this.timerId);

            this.setState({
                stopped: true
            });
        }
    };

    componentWillReceiveProps(props) {

        const { stopwatch } = props;
        const { stopped } = this.state;

        if (stopwatch === 'stop' && !stopped) {
            this.stop();
        }

        if (stopwatch === 'start' && stopped) {
            this.start();
        }
    }

    render() {

        const {time, stopped} = this.state;

        return (
            <h1 className={ stopped && !time ? 'hidden' : ''}>{ Math.round(time / 1000) }.{ time % 1000} сек.</h1>
        )
    }
}

export default connect(mapStateToProps)(Stopwatch);
