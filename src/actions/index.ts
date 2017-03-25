import {

    UPDATE_MONITOR_ITEM,
    LIFE_DATA_FROM_STEPS,
    INITIAL_LIFE_DATA, INITIAL_LIFE_DATA_COMPLETED,
    STOP_STOPWATCH, START_STOPWATCH,
    UPDATE_CPU_CHART, UPDATE_CPU_CHART_COMPLETED

} from '../constants/actions'

export function updateMonitorItem(data) {
    return {
        type: UPDATE_MONITOR_ITEM,
        data
    };
}

export function updateCpuChart(data) {
    return {
        type: UPDATE_CPU_CHART,
        data
    };
}

export function updateCpuChartCompleted() {
    return {
        type: UPDATE_CPU_CHART_COMPLETED
    };
}

export function initialLifeData(data) {
    return {
        type: INITIAL_LIFE_DATA,
        data
    };
}

export function updateLifeData(data) {
    return {
        type: LIFE_DATA_FROM_STEPS,
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
