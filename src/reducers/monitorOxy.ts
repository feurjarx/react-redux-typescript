import {UPDATE_MONITOR, CLEAR_MONITOR} from "../constants/actions";

export const monitorOxy = (state = [], action) => {

    let nextState: Array<any>;

    switch (action.type) {
        case CLEAR_MONITOR:
            nextState = [];
            break;

        case UPDATE_MONITOR:

            const { id, requestCounter } = action.data;
            const oxyItem = {
                id,
                requestCounter,
                name: `Server ${ id + 1 }`
            };

            let existedId = false;
            nextState = state.map(it => {

                if (id === it.id) {
                    it = oxyItem;
                    existedId = true;
                }

                return it;
            });

            if (!existedId) {
                nextState.push(oxyItem)
            }

            break;

        default:
            nextState = state;
    }

    return nextState;
};