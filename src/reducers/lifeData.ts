import {

    INITIAL_LIFE_DATA, INITIAL_LIFE_DATA_COMPLETED

} from "../constants/actions";

import {Life} from "../../typings/todo";

export const lifeData = (state = null, action) => {

    let nextState: Life.Params;

    switch (action.type) {

        case INITIAL_LIFE_DATA:

            const nClients = +action.data.nClients;
            const nServers = +action.data.nServers;
            const actual = true;
            nextState = { ...action.data, nClients, nServers, actual };

            break;

        case INITIAL_LIFE_DATA_COMPLETED:
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