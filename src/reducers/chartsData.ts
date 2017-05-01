import {
    PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART,
    PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
    UPDATE_REGIONS_PIES_CHARTS,
    INIT_CHARTS_DATA
} from "../constants/actions";

export default function chartsData(state = {}, action) {

    switch (action.type) {
        case UPDATE_REGIONS_PIES_CHARTS:

            return {
                ...state,
                ...action.data
            };

        case INIT_CHARTS_DATA:

            return {
                ...state,
                initial: action.data,
            };

        case PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM:

            return {
                ...state,
                initial: null,
                requestsDiagramNewItem: action.data
            };

        case PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART:

            return {
                ...state,
                initial: null,
                slavesLoadNewTimeList: action.data
            };

        default:
            return state;
    }
};