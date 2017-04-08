import {
    PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
    PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER,
    UPDATE_REGIONS_PIES_CHARTS,
    UPDATE_CPU_CHART_COMPLETED,
    INIT_REQUESTS_DIAGRAM,
    OTHER_STEPS_DATA,
    UPDATE_CPU_CHART,
    START_STOPWATCH,
    STOP_STOPWATCH
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

export function pushLogsBatchToConsoleDrawer(logsJson) {
    return {
        type: PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER,
        logsJson
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
