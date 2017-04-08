import * as Redux from 'redux';
import {stopwatch} from './stopwatch';
import {cpuChart} from './cpuChart';
import {otherStepsData} from './otherStepsData';
import chartsData from './chartsData';
import logsInfo from './logsInfo';


export const app = Redux.combineReducers({
    otherStepsData,
    chartsData,
    stopwatch,
    cpuChart,
    logsInfo
});

export default app;