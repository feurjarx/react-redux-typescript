import * as Redux from 'redux';
import { monitor } from './monitor';
import { monitorItem } from './monitorItem';
import { lifeData } from './lifeData';
import { stopwatch } from './stopwatch';
import { cpuChart } from './cpuChart';
import { otherStepsData } from './otherStepsData';
import chartsData from './chartsData';

export const app = Redux.combineReducers({
    otherStepsData,
    monitorItem,
    chartsData,
    stopwatch,
    cpuChart,
    lifeData,
    monitor
});

export default app;