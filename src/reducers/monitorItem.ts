import {

    UPDATE_MONITOR_ITEM

} from "../constants/actions";

import {Monitor} from "../../typings/todo";

export const monitorItem = (state = null, action) => {

    let nextState: Monitor.Item;

    switch (action.type) {
        case UPDATE_MONITOR_ITEM:

            const { id, requestCounter } = action.data;
            nextState = {
                id,
                requestCounter,
                name: `Server ${ id + 1 }`
            };

            break;

        default:
            nextState = state;
    }

    return nextState;
};