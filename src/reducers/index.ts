import * as Redux from 'redux';
import { monitorItem } from './monitorItem';
import { lifeData } from './lifeData';

export const app = Redux.combineReducers({
    monitorItem,
    lifeData
});

export default app;