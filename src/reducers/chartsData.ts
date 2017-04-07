import {
    PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
    UPDATE_REGIONS_PIES_CHARTS,
    INIT_REQUESTS_DIAGRAM
} from "../constants/actions";

export default function chartsData(state = {}, action) {

    switch (action.type) {
        case UPDATE_REGIONS_PIES_CHARTS:

            return {
                ...state,
                ...action.data
            };

        case INIT_REQUESTS_DIAGRAM:

            return {
                ...state,
                requestsDiagram: {
                    initial: action.data
                }
            };

        case PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM:

            return {
                ...state,
                requestsDiagram: {
                    newItem: action.data
                }
            };

        default:
            return state;
    }
};