import {
    OTHER_STEPS_DATA,
} from "../constants/actions";

export const otherStepsData = (state = {}, action) => {

    switch (action.type) {
        case OTHER_STEPS_DATA:
            return {
                ...state,
                ...action.data
            };

        default:
            return state;
    }
};