import {
    PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER
} from "../constants/actions";

export default function logsInfo(state = {}, action) {

    switch (action.type) {
        case PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER:

            const {logsJson} = action;
            return {
                ...state,
                logsJson
            };

        default:
            return state;
    }
};