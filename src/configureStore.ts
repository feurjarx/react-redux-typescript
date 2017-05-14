// import {createStore, applyMiddleware} from 'redux';
import * as Redux from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers'

import logger from 'redux-logger';

export default function(inititalState = {}) {
    return Redux.createStore(
        rootReducer,
        inititalState,
        // Redux.applyMiddleware(thunk, logger)
        Redux.applyMiddleware(thunk)
    );
}