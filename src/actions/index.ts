import {

    UPDATE_MONITOR_ITEM,
    UPDATE_REGIONS_PIES_CHARTS,
    OTHER_STEPS_DATA,
    INITIAL_LIFE_DATA, INITIAL_LIFE_DATA_COMPLETED,
    STOP_STOPWATCH, START_STOPWATCH,
    UPDATE_CPU_CHART, UPDATE_CPU_CHART_COMPLETED, INIT_REQUESTS_DIAGRAM, PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM

} from '../constants/actions'

export function updateCpuChart(data) {
    return {
        type: UPDATE_CPU_CHART,
        data
    };
}

export function updateRegionsPiesCharts(data) {
    return {
        type: UPDATE_REGIONS_PIES_CHARTS,
        data
    };
}

export function updateCpuChartCompleted() {
    return {
        type: UPDATE_CPU_CHART_COMPLETED
    };
}

export function initRequestsDiagram(data) {
    return {
        type: INIT_REQUESTS_DIAGRAM,
        data
    };
}

export function pushNewItemToRequestsDiagram(data) {
    return {
        type: PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
        data
    };
}


export function updateOtherStepsData(data) {
    return {
        type: OTHER_STEPS_DATA,
        data
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
