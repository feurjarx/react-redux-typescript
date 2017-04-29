import * as Redux from 'redux';
import {stopwatch} from './stopwatch';
import {otherStepsData} from './otherStepsData';
import chartsData from './chartsData';
import logsInfo from './logsInfo';
import {processActivated} from './processing';

export default Redux.combineReducers({
    processActivated,
    otherStepsData,
    chartsData,
    stopwatch,
    logsInfo
});