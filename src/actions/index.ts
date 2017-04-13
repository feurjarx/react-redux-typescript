import {
    PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
    PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER,
    UPDATE_REGIONS_PIES_CHARTS,
    INIT_CHARTS_DATA,
    OTHER_STEPS_DATA,
    START_STOPWATCH,
    STOP_STOPWATCH, PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART
} from '../constants/actions'

export function updateRegionsPiesCharts(data) {
    return {
        type: UPDATE_REGIONS_PIES_CHARTS,
        data
    };
}

export function pushNewItemsToSlavesLoadChart(data) {
    return {
        type: PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART,
        data
    };
}

export function initChartsData(data) {
    return {
        type: INIT_CHARTS_DATA,
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
