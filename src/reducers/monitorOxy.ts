import {UPDATE_MONITOR} from "../constants/actions";

export const monitorOxy = (state = [], action) => {

    let nextState: Array<any>;

    switch (action.type) {
        case UPDATE_MONITOR:

            debugger

            const { id, requestCounter } = action.data;

            let existedId = false;
            nextState = state.map(it => {

                if (id === it.id) {
                    it = Object.assign({}, it); // todo: immutable ??
                    it.y = requestCounter;

                    existedId = true;
                }

                return it;
            });

            if (!existedId) {
                nextState.push({
                    id,
                    y: requestCounter
                })
            }

            // nextState = action.data;
            break;

        default:
            nextState = state;
    }

    return nextState;
};