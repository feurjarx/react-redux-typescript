import {

    UPDATE_CPU_CHART_COMPLETED, UPDATE_CPU_CHART

} from "../constants/actions";


const initial = {
    absThroughput: 0
};

export const cpuChart = (state = initial, action) => {

    let nextState;

    switch (action.type) {
        case UPDATE_CPU_CHART:

            const { absThroughput } = action.data;
            nextState = {
                absThroughput,
                actual: true
            };

            break;

        case UPDATE_CPU_CHART_COMPLETED:

            nextState = {
                ...state,
                actual: false
            };

            break;

        default:
            nextState = state;
    }

    return nextState;
};