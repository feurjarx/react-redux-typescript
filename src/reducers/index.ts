import * as Redux from 'redux';
import { monitor } from './monitor';
import { monitorItem } from './monitorItem';
import { lifeData } from './lifeData';
import { stopwatch } from './stopwatch';

export const app = Redux.combineReducers({
    monitor,
    monitorItem,
    lifeData,
    stopwatch
});

export default app;