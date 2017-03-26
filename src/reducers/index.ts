import * as Redux from 'redux';
import { monitor } from './monitor';
import { monitorItem } from './monitorItem';
import { lifeData } from './lifeData';
import { stopwatch } from './stopwatch';
import { cpuChart } from './cpuChart';
import { otherStepsData } from './otherStepsData';

export const app = Redux.combineReducers({
    monitor,
    monitorItem,
    cpuChart,
    lifeData,
    stopwatch,
    otherStepsData
});

export default app;