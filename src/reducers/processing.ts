import {PROCESS_ACTIVATED} from "../constants/index";

export function processActivated(state = false, action) {
    switch (action.type) {
        case PROCESS_ACTIVATED:
            return action.activated;
        default:
            return state;
    }
}