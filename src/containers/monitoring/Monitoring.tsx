import * as React from "react";

import "./monitoring.css";
import {connect} from "react-redux";

const CanvasJS = require('canvasjs/dist/canvasjs.js');

interface Oxy {
    x: number;
    y: number;
    label?: string;
}

interface MonitoringProps {
    monitorOxy: Array<{
        id: number;
        name: string;
        requestCounter: number;
    }>
}

function mapStateToProps(state, props) {

    const { monitorOxy } = state;

    return {
        monitorOxy
    }
}

class MonitoringConnectable extends React.Component<MonitoringProps, React.ComponentState> {

    chartId = 'life-rt-chart';

    chart: CanvasJS.Chart;

    dataPoints: Array<Oxy> = [];

    constructor() {
        super();
    }

    initChart() {

        const { dataPoints } = this;

        this.chart = new CanvasJS.Chart(this.chartId, {
            title :{
                text: "Обработка клиентских запросов"
            },
            theme: "theme2",
            legend:{
                verticalAlign: "top",
                horizontalAlign: "centre",
                fontSize: 18
            },
            data: [{
                type: "column",
                // showInLegend: true,
                legendMarkerType: "none",
                legendText: 'text',
                indexLabel: "{y}",
                dataPoints
            }]
        });
    }

    componentDidMount() {
        this.initChart()
    }

    // todo: try receiving from io

    componentWillReceiveProps(props) {

        const { dataPoints, chart } = this;

        const { monitorOxy } = props;

        monitorOxy.forEach(it => {

            if (dataPoints[it.id]) {
                dataPoints[it.id].y = it.requestCounter;

            } else {

                dataPoints[it.id] = {
                    x: it.id,
                    y: it.requestCounter,
                    label: it.name
                };
            }
        });

        chart.render();
    }

    render() {

        return (
            <div id={ this.chartId }></div>
        );
    }
}

export const Monitoring = connect(mapStateToProps)(MonitoringConnectable);