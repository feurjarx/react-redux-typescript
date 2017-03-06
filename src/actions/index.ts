import {

    UPDATE_MONITOR, CLEAR_MONITOR

} from '../constants/actions'

export function updateMonitor(data) {
    return {
        type: UPDATE_MONITOR,
        data
    };
}

export function clearMonitor() {
    return {
        type: CLEAR_MONITOR
    };
}