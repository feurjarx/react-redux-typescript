import * as React from "react";
import {

    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend

} from 'recharts';

import {connect} from "react-redux";

function mapStateToProps(state, props) {

    const { monitorOxy } = state;

    return {
        monitorOxy
    }
}

@connect(mapStateToProps)
export class Monitoring extends React.Component<any, React.ComponentState> {

    constructor() {
        super();
    }

    render() {

        const { monitorOxy } = this.props;

        return (
            <LineChart width={600} height={300} data={ monitorOxy }
                       margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <XAxis dataKey="name"/>
                <YAxis />
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip/>
                <Legend />
                <Line type="monotone" dataKey="requestCounter" stroke="#8884d8" activeDot={{r: 8}}/>
            </LineChart>
        );
    }
}
