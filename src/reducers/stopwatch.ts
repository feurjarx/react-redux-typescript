import {START_STOPWATCH, STOP_STOPWATCH } from "../constants/actions";

export const stopwatch = (state = 'stop', action) => {

    let nextState: string;

    switch (action.type) {
        case START_STOPWATCH:

            nextState = 'start';
            break;

        case STOP_STOPWATCH:

            nextState = 'stop';
            break;

        default:
            nextState = state;
    }

    return nextState;
};