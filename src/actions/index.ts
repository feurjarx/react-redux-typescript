import {

    UPDATE_MONITOR_ITEM,
    INITIAL_LIFE_DATA, INITIAL_LIFE_DATA_COMPLETED,
    STOP_STOPWATCH, START_STOPWATCH,


} from '../constants/actions'

export function updateMonitorItem(data) {
    return {
        type: UPDATE_MONITOR_ITEM,
        data
    };
}

export function initialLifeData(data) {
    return {
        type: INITIAL_LIFE_DATA,
        data
    };
}

export function initialLifeDataCompleted() {
    return {
        type: INITIAL_LIFE_DATA_COMPLETED
    };
}

export function stopStopwatch() {
    return {
        type: STOP_STOPWATCH,
        state: 'stop'
    };
}

export function startStopwatch() {
    return {
        type: START_STOPWATCH,
        state: 'start'
    };
}
