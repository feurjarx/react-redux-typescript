import * as Redux from 'redux';
import {stopwatch} from './stopwatch';
import {otherStepsData} from './otherStepsData';
import chartsData from './chartsData';
import logsInfo from './logsInfo';

export const app = Redux.combineReducers({
    otherStepsData,
    chartsData,
    stopwatch,
    logsInfo
});

export default app;