import * as React from "react";
import {connect} from "react-redux";
import * as Recharts from "recharts/lib";
import {pallete} from "./../../configs"
const { PieChart, Pie, Cell, Tooltip } = Recharts;

function mapStateToProps(state) {
    const {regionsServersPies} = state.chartsData;
    return {
        pies: regionsServersPies
    };
}

class RegionsPiesChartConnectable extends React.Component<any, any> {

    constructor() {
        super();

        this.state = {
            pies: []
        };
    }

    componentWillReceiveProps(props) {
        const {pies} = props;
        this.setState({pies})
    }

    render() {

        const {pies} = this.state;

        let pieChart: JSX.Element = null;
        if (pies.length) {
            pieChart = (
                <PieChart width={pies.length * 300} height={200}>
                    {
                        pies.map(({chartData}, i) => {
                            return (
                                <Pie
                                    key={i}
                                    data={chartData}
                                    cx={250 * (i + 1)}
                                    cy={100}
                                    labelLine={false}
                                    label={PieLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                >
                                    {chartData.map((entry, j) => <Cell key={j} fill={pallete[j % pallete.length]}/>)}
                                </Pie>
                            )})
                    }
                    <Tooltip />
                </PieChart>
            )
        }

        return (
            <div className={`${pies.length ? '' : 'hidden'}`}>
                <h2 className="text-center">Заполнение регионов</h2>
                {pieChart}
            </div>
        )
    }
}

const RADIAN = Math.PI / 180;
const PieLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent}) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x  = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy  + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const RegionsPiesChart = connect(mapStateToProps)(RegionsPiesChartConnectable);
export default RegionsPiesChart;