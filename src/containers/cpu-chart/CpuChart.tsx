import * as React from "react";

import "./monitoring.css";
import {connect} from "react-redux";
import {Monitor, Life} from "../../../typings/todo";
import ChartOptions = CanvasJS.ChartOptions;
import ChartDataPoint = CanvasJS.ChartDataPoint;
import {initialLifeDataCompleted} from "../../actions/index";

const CanvasJS = require('canvasjs/dist/canvasjs.js');

interface MonitoringProps {
    monitor: any;
    monitorItem: Monitor.Item;
    lifeData: Life.Params;
    dispatch(...args);
}

function mapStateToProps(state, props) {
    return state;
}

class CpuChartConnectable extends React.Component<MonitoringProps, React.ComponentState> {

    chartId = 'life-rt-cpu-chart';

    chart: CanvasJS.Chart;

    dataPoints: Array<CanvasJS.ChartDataPoint> = [];

    constructor() {
        super();
    }

    initChart(initialLifeData:Life.Params) {

        this.clearMonitor();

        const { dataPoints } = this;
        let { nClients, nServers, requestsLimit } = initialLifeData;

        /// ...


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

    clearMonitor() {
        // Warning! Can not dataPoints = []
        while (this.dataPoints.pop()) {}
    }

    componentWillReceiveProps(props: MonitoringProps) {

        const {monitorItem, lifeData, dispatch} = props;
        if (lifeData.actual) {
            // this.initChart(lifeData);
            // dispatch(initialLifeDataCompleted());

        } else if (monitorItem) {
            // this.dataPoints[monitorItem.id].y = monitorItem.requestCounter;
            // todo: push + shift
        }

        this.chart.render();
    }

    render() {

        return (
            <div id={ this.chartId }></div>
        );
    }
}

export const CpuChart = connect(mapStateToProps)(CpuChartConnectable);