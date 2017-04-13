import * as React from "react";

import {connect} from "react-redux";
import ChartOptions = CanvasJS.ChartOptions;
import ChartDataPoint = CanvasJS.ChartDataPoint;

const CanvasJS = require('canvasjs/dist/canvasjs.js');

function mapStateToProps(state) {
    const {requestsDiagramNewItem, initial} = state.chartsData;

    return {
        requestsDiagramNewItem,
        initial
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

        // this.clear();
        this.idxPointByServerIdMap = {};
        this.dataPoints = [];

        const {idxPointByServerIdMap} = this;
        let {requestsDiagramMaxValue, serversIds} = initialChartData;

        serversIds.forEach((id,i) => {
            this.dataPoints.push({
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
                maximum: requestsDiagramMaxValue
            },
            data: [{
                type: "column",
                bevelEnabled: true,
                indexLabel: "{y}",
                dataPoints: this.dataPoints
            }]
        });
    }

    componentWillReceiveProps(props) {

        const {requestsDiagramNewItem, initial} = props;
        if (initial) {
            this.initChart(initial);

        } else if (requestsDiagramNewItem) {

            const {slaveId, requestsCounter} = requestsDiagramNewItem;
            const idx = this.idxPointByServerIdMap[slaveId];
            this.dataPoints[idx].y = requestsCounter;

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