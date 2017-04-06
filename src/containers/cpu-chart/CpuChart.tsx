import * as React from "react";
import {connect} from "react-redux";

import "./cpu-chart.css";

import ChartOptions = CanvasJS.ChartOptions;
import ChartDataPoint = CanvasJS.ChartDataPoint;
import {updateCpuChartCompleted} from "../../actions/index";
const CanvasJS = require('canvasjs/dist/canvasjs.js');

function mapStateToProps(state, props) {
    return state;
}

class CpuChartConnectable extends React.Component<any, React.ComponentState> {

    chartId = 'life-rt-cpu-chart';

    chart: CanvasJS.Chart;

    dataPoints: Array<CanvasJS.ChartDataPoint> = [];

    offset = 100;

    constructor() {
        super();
    }

    initChart() {

        const { dataPoints } = this;
        this.chart = new CanvasJS.Chart(this.chartId, {
            title :{
                text: "Нагрузка на систему"
            },
            data: [{
                type: "line",
                dataPoints
            }]
        });
    }

    componentDidMount() {
        this.initChart();
    }

    componentWillReceiveProps(props) {

        const { cpuChart, dispatch } = props;

        if (cpuChart.actual) {

            const { absBandwidth } = cpuChart;
            const { chart, dataPoints, offset } = this;

            dataPoints.push({
                x: dataPoints.length,
                y: absBandwidth
            });

            // if (dataPoints.length > offset) {
            //     dataPoints.shift();
            // }

            chart.render();

            dispatch(updateCpuChartCompleted());
        }
    }

    render() {

        return (
            <div id={ this.chartId }></div>
        );
    }
}

export const CpuChart = connect(mapStateToProps)(CpuChartConnectable);