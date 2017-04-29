import * as React from "react";
import {connect} from "react-redux";
import * as Recharts from "recharts/lib";
import {pallete} from "./../../configs"
const {PieChart, Pie, Cell, Tooltip} = Recharts;

function mapStateToProps(state) {
    const {regionsPiesCharts} = state.chartsData;
    return {
        pies: regionsPiesCharts,
    };
}

class RegionsPiesChart extends React.Component<any, any> {

    constructor() {
        super();

        this.state = {
            pies: []
        };
    }

    componentWillReceiveProps(props) {
        const {pies = []} = props;
        this.setState({pies});
    }

    render() {

        const {pies} = this.state;

        let pieChart: JSX.Element = null;
        if (pies.length) {

            const height = document.getElementById('tabs-content').clientHeight - 58;
            const radius = 1/2 * height - 70;
            const diameter = 2 * radius;
            const interval = 20;
            const width = pies.length * (diameter + interval) + interval;

            pieChart = (
                <PieChart width={width} height={height}>
                    {
                        pies.map(({chartData}, i) => {

                            let pie: JSX.Element;
                            if (chartData.every(it => !it.value)) {
                                pie = (
                                    <Pie
                                        key={i}
                                        data={[{name: 'Сервер не заполнен', value: 100}]}
                                        cx={(diameter + 20) * i + radius + 20}
                                        cy={1.5 * radius}
                                        labelLine={false}
                                        outerRadius={radius}
                                        fill="#8884d8"
                                    >
                                        <Cell key={0} fill="#8a7f7f"/>
                                    </Pie>
                                );

                            } else {

                                pie = (
                                    <Pie
                                        key={i}
                                        data={chartData}
                                        cx={(diameter + 20) * i + radius + 20}
                                        cy={1.5 * radius}
                                        labelLine={false}
                                        label={PieLabel}
                                        outerRadius={radius}
                                        fill="#8884d8"
                                    >
                                        {chartData.map((entry, j) => <Cell key={j} fill={pallete[j % pallete.length]}/>)}
                                    </Pie>
                                );
                            }

                            return pie;
                        })
                    }
                    <Tooltip />
                </PieChart>
            )
        }

        return (
            <div className={`${pies.length ? '' : 'hidden'}`}>
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

export default connect(mapStateToProps)(RegionsPiesChart);