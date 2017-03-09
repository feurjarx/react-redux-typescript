import {

    UPDATE_MONITOR, CLEAR_MONITOR, INIT_MONITOR

} from '../constants/actions'

export function initMonitor(nServers: number) {
    return {
        type: INIT_MONITOR,
        nServers
    };
}

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