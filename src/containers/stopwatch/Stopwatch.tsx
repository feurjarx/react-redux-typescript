import * as React from "react";
import {connect} from "react-redux";

class Stopwatch extends React.Component<any, any> {

    timerId;

    constructor() {
        super();

        this.state = {
            stopped: true,
            time: 0
        };
    }

    start() {

        this.reset();

        this.timerId = setInterval(() => {

            let { time } = this.state;
            time += 10;

            this.setState({ time });

        }, 10);

        this.setState({
            stopped: false
        });
    };

    reset() {
        this.setState({
            time: 0
        });
    };

    stop() {
        clearInterval(this.timerId);

        this.setState({
            stopped: true
        });
    };

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

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
        const {style} = this.props;

        return (
            <b
                className={ stopped && !time ? 'hidden' : ''}
                style={style}
            >
                { Math.round(time / 1000) }.{ time % 1000} сек.
            </b>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        stopwatch: state.stopwatch
    };
}

export default connect(mapStateToProps)(Stopwatch);
