import { STOP_MONITOR } from "../constants/actions";

export const monitor = (state = null, action) => {

    let nextState;

    switch (action.type) {
        case STOP_MONITOR:
            nextState = {
                last: true
            };

            break;

        default:
            nextState = state;
    }

    return nextState;
};