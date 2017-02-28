import {Todo} from "../../typings/todo";
import {ADD_TODO, TOGGLE_TODO, SET_VISIBILITY_FILTER} from "../constants/actionTypes";

const initialTodoState = {
    visibilityFilter: 'all',
    todos: []
} as Todo.State;

export const todoApp = (state: Todo.State = initialTodoState, action) => {

    const nextState = Object.assign({}, state);

    switch (action.type) {
        case ADD_TODO:

            const todos = [ ...nextState.todos, {
                text: action.text,
                completed: false
            }];

            nextState.todos = todos;
            nextState.visibilityFilter = 'all';

            break;

        case TOGGLE_TODO:
            nextState.todos = nextState.todos.map((todo, idx: number) => {
                if (idx === action.idx) {
                    todo.completed = !todo.completed;
                }

                return todo;
            });

            break;

        case SET_VISIBILITY_FILTER:
            nextState.visibilityFilter = action.filter;
            break;
    }

    return nextState;
};