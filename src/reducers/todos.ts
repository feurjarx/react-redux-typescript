import {ADD_TODO, TOGGLE_TODO} from "../constants/actions";
import {Todo} from "../../typings/todo";

export const todos = (state: Array<Todo.Item> = [], action) => {

    let nextState: Array<Todo.Item>;

    switch (action.type) {
        case ADD_TODO:

            nextState = [
                ...state, {
                    text: action.text,
                    completed: false
                }
            ];

            break;

        case TOGGLE_TODO:

            nextState = state.map((todo, idx) => {

                let completed = todo.completed;
                if (idx === action.idx) {
                    completed = !todo.completed;
                }

                return Object.assign({}, todo, {
                    completed
                })
            });

            break;

        default:
            nextState = state;
    }

    return nextState;
};