import * as Redux from 'redux';
import { monitorOxy } from './monitorOxy';

export const app = Redux.combineReducers({
    monitorOxy
});

export default app;