import * as React from "react";
import RegionsPiesCharts from "./../regions-pies-charts/RegionsPiesCharts";
import Monitoring from "./../monitoring/Monitoring";
import {CpuChart} from "./../cpu-chart/CpuChart";
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';

export default class ChartsTabs extends React.Component<any, any> {
    constructor() {
        super();

        this.state = {
            slideIndex: 0,
        };
    }

    handleChange = (slideIndex) => {
        this.setState({slideIndex});
    };

    render() {
        const {handleChange} = this;
        const {slideIndex} = this.state;
        const tabs = [
            <RegionsPiesCharts key={0}/>,
            <Monitoring key={1}/>,
            //<CpuChart key={2}/>
        ];

        return (
            <div style={{alignSelf: 'stretch', height: 'calc(100% - 55px)'}} id="tabs-content">
                <Tabs onChange={handleChange} value={slideIndex}>
                    <Tab label="Регионы" value={0} />
                    <Tab label="Запросы" value={1} />
                    {/*
                     <Tab label="Нагрузка" value={2} />
                    */}
                </Tabs>
                <SwipeableViews
                    index={slideIndex}
                    onChangeIndex={handleChange}
                    slideStyle={{overflowY: 'hidden'}}
                >
                    {tabs}
                </SwipeableViews>
            </div>
        )
    }
}