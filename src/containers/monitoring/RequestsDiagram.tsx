import * as React from "react";

import {connect} from "react-redux";
import ChartOptions = CanvasJS.ChartOptions;
import ChartDataPoint = CanvasJS.ChartDataPoint;

const CanvasJS = require('canvasjs/dist/canvasjs.js');

function mapStateToProps(state) {
    const {requestsDiagram} = state.chartsData;
    return {
        requestsDiagram
    };
}

class RequestsDiagram extends React.Component<any, React.ComponentState> {

    chartId = 'life-rt-chart';
    chart: CanvasJS.Chart;

    dataPoints: Array<CanvasJS.ChartDataPoint> = [];
    idxPointByServerIdMap = {};

    constructor() {
        super();
    }

    initChart(initialChartData) {

        this.clear();

        const {dataPoints, idxPointByServerIdMap} = this;
        let {maxValue, serversIds} = initialChartData;

        serversIds.forEach((id,i) => {
            dataPoints.push({
                x: i,
                y: 0,
                label: `Регион сервер ${id}`
            });

            idxPointByServerIdMap[id] = i;
        });

        this.chart = new CanvasJS.Chart(this.chartId, {
            title :{
                text: "Обработка клиентских запросов"
            },
            axisY: {
                gridThickness: 0,
                minimum: 0,
                maximum: maxValue
            },
            data: [{
                type: "column",
                bevelEnabled: true,
                indexLabel: "{y}",
                dataPoints
            }]
        });
    }

    clear() {
        // Warning! Can not dataPoints = []
        while (this.dataPoints.pop()) {}
        this.idxPointByServerIdMap = {};
    }

    componentWillReceiveProps(props) {

        const {requestsDiagram} = props;
        if (requestsDiagram) {

            if (requestsDiagram.newItem) {

                const {slaveServerId, requestCounter} = requestsDiagram.newItem;
                const idx = this.idxPointByServerIdMap[slaveServerId];
                this.dataPoints[idx].y = requestCounter;

            } else {

                this.initChart(requestsDiagram.initial);
            }

            this.chart.render();
        }
    }

    render() {

        return (
            <div style={{width: '100%'}} id={this.chartId}></div>
        );
    }
}

export default connect(mapStateToProps)(RequestsDiagram);