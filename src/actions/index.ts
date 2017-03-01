import {ADD_TODO,TOGGLE_TODO, SET_VISIBILITY_FILTER} from '../constants/actions'
import {Todo} from "../../typings/todo";

export function addTodo(text: string) {
    return {
        type: ADD_TODO,
        text
    }
}

export function toggleTodo(idx: number) {
    return {
        type: TOGGLE_TODO,
        idx
    }
}

export function setVisibilityFilter(filter: Todo.VisibilityFilter) {
    return {
        type: SET_VISIBILITY_FILTER,
        filter
    };
}