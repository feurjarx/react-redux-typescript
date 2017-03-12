import * as Redux from 'redux';
import { monitor } from './monitor';
import { monitorItem } from './monitorItem';
import { lifeData } from './lifeData';

export const app = Redux.combineReducers({
    monitor,
    monitorItem,
    lifeData
});

export default app;