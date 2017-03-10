import {

    INITIAL_LIFE_DATA

} from "../constants/actions";

import {Life} from "../../typings/todo";

export const lifeData = (state, action) => {

    let nextState: Life.Params;

    switch (action.type) {
        case INITIAL_LIFE_DATA:
            const nClients = +action.data.nClients;
            const nServers = +action.data.nServers;
            nextState = { ...action.data, nClients, nServers };
            break;

        default:
            nextState = null;
    }

    return nextState;
};