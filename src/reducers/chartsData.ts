import {
    UPDATE_REGIONS_PIES_CHARTS,
} from "../constants/actions";

export default function chartsData(state = {}, action) {

    switch (action.type) {
        case UPDATE_REGIONS_PIES_CHARTS:
            return action.data;

        default:
            return state;
    }
};