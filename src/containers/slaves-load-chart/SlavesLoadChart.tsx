import * as React from "react";
import {connect} from "react-redux";

import * as CanvasJS from 'canvasjs/dist/canvasjs.min.js';

function mapStateToProps(state, props) {
    const {slavesLoadNewTimeList, initial} = state.chartsData;

    return {
        slavesLoadNewTimeList,
        initial
    };
}

class SlavesLoadChart extends React.Component<any, React.ComponentState> {

    private static axisXMaxWidth = 100;

    chartId = 'slaves-load-chart';
    chart: CanvasJS.Chart;
    chartSource;

    xCounter: number;

    initChart(initialChartData) {

        this.chartSource = initialChartData.serversIds.map(id => ({
            type: "line",
            // type: "spline",
            name: id,
            dataPoints: [],
            markerSize: 0,
        }));

        this.chart = new CanvasJS.Chart(this.chartId, {
            title :{
                text: "Нагрузка на регион-сервера"
            },
            toolTip: {
                shared: true,
                content: SnapshotTooltipRaw
            },
            animationEnabled: true,
            data: this.chartSource
        });

        this.xCounter = 0;
    }

    componentWillReceiveProps(props) {

        const {slavesLoadNewTimeList, initial} = props;
        if (initial) {
            this.initChart(initial);

        } else if (slavesLoadNewTimeList) {

            slavesLoadNewTimeList.forEach((time, i) => {
                const {dataPoints} = this.chartSource[i];
                dataPoints.push({
                    x: this.xCounter,
                    y: time
                });

                if (dataPoints.length > SlavesLoadChart.axisXMaxWidth) {
                    dataPoints.shift();
                }
            });

            this.chart.render();

            this.xCounter++;
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render() {
        return (
            <div style={{width: '100%'}} id={ this.chartId }></div>
        );
    }
}

const SnapshotTooltipRaw = ({entries}) => {

    const head = (
        `<p style="color: DodgerBlue">
            <strong>Снимок ${entries[0].dataPoint.x}</strong>
        </p>`
    );

    const body = entries.map(entry => (
        `<span style="color:${entry.dataSeries.color}">${entry.dataSeries.name}</span>:
        <strong>${entry.dataPoint.y}</strong>`
    )).join('<br/>');

    return head.concat(body);
};

export default connect(mapStateToProps)(SlavesLoadChart);