import {

    UPDATE_MONITOR

} from '../constants/actions'

export function updateMonitor(data) {
    return {
        type: UPDATE_MONITOR,
        data
    };
}