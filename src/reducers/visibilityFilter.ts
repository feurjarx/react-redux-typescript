import {SET_VISIBILITY_FILTER} from "../constants/actions";

export const visibilityFilter = (state = 'all', action) => {

    let nextState: string;

    switch (action.type) {
        case SET_VISIBILITY_FILTER:
            nextState = action.filter;
            break;
        default:
            nextState = state;
    }

    return nextState;
};