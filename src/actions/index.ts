import {
    OTHER_STEPS_DATA,
    START_STOPWATCH,
    STOP_STOPWATCH
} from '../constants/actions'


export function updateOtherStepsData(data) {

    return {
        type: OTHER_STEPS_DATA,
        data
    };
}

export function stopStopwatch() {
    return {
        type: STOP_STOPWATCH,
        state: 'stop'
    };
}

export function startStopwatch() {
    return {
        type: START_STOPWATCH,
        state: 'start'
    };
}
