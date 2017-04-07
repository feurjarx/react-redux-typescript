import * as Redux from 'redux';
import { stopwatch } from './stopwatch';
import { cpuChart } from './cpuChart';
import { otherStepsData } from './otherStepsData';
import chartsData from './chartsData';

export const app = Redux.combineReducers({
    otherStepsData,
    chartsData,
    stopwatch,
    cpuChart
});

export default app;