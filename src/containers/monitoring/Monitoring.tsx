import * as React from "react";

import "./monitoring.css";
import {connect} from "react-redux";
import {Monitor, Life} from "../../../typings/todo";
import ChartOptions = CanvasJS.ChartOptions;
import ChartDataPoint = CanvasJS.ChartDataPoint;

const CanvasJS = require('canvasjs/dist/canvasjs.js');

interface MonitoringProps {
    monitorItem: Monitor.Item;
    lifeData: Life.Params;
}

function mapStateToProps(state, props) {
    return state;
}

class MonitoringConnectable extends React.Component<MonitoringProps, React.ComponentState> {

    chartId = 'life-rt-chart';

    chart: CanvasJS.Chart;

    dataPoints: Array<CanvasJS.ChartDataPoint> = [];

    constructor() {
        super();
    }

    initChart(initialLifeData:Life.Params) {

        this.clearMonitor();

        const { dataPoints } = this;
        let { nClients, nServers } = initialLifeData;

        for (let i = 0; i < nServers; i++) {
            dataPoints.push({
                x: i,
                y: 0,
                label: `Server ${ i + 1 }`
            })
        }

        this.chart = new CanvasJS.Chart(this.chartId, {
            title :{
                text: "Обработка клиентских запросов"
            },
            axisY: {
                minimum: 0,
                maximum: nClients + 10,
            },
            data: [{
                type: "column",
                bevelEnabled: true,
                indexLabel: "{y}",
                dataPoints
            }]
        });
    }

    clearMonitor() {
        // Warning! Can not dataPoints = []
        while (this.dataPoints.pop()) {}
    }

    componentWillReceiveProps(props: MonitoringProps) {

        const {lifeData, monitorItem} = props;
        if (lifeData) {
            this.initChart(lifeData);
        } else {
            this.dataPoints[monitorItem.id].y = monitorItem.requestCounter;
        }

        this.chart.render();
    }

    render() {

        return (
            <div id={ this.chartId }></div>
        );
    }
}

export const Monitoring = connect(mapStateToProps)(MonitoringConnectable);