import * as React from "react";
import reactCSS from "reactcss"
import {Preparing} from "./preparing/Preparing";
import RegionsPiesCharts from "./regions-pies-charts/RegionsPiesCharts";
import {Monitoring} from "./monitoring/Monitoring";
import {Stopwatch} from "./stopwatch/Stopwatch";
import {CpuChart} from "./cpu-chart/CpuChart";

export class Content extends React.Component<any, React.ComponentState> {

    constructor() {
        super();
    }



    render() {

        return (
            <div style={ styles.base }>
                <Preparing />
                <Stopwatch />
                <RegionsPiesCharts />
                <Monitoring />
                <CpuChart />
            </div>
        )
    }
}

const styles = reactCSS({
    default: {
        base: {
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'space-around'
        }
    }
});
