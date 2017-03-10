import {

    UPDATE_MONITOR_ITEM,
    INITIAL_LIFE_DATA

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
