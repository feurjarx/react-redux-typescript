import {

    UPDATE_MONITOR_ITEM,
    INITIAL_LIFE_DATA,
    STOP_MONITOR

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

export function stopMonitor() {
    return {
        type: STOP_MONITOR
    };
}

