import * as React from "react";
import * as Redux from "redux";
import {connect} from "react-redux";

import ComponentState = React.ComponentState;
import {Todo} from "../../typings/todo";
import {TodoItem} from "./TodoItem";

import {toggleTodo} from "../actions/index";

export interface TodoListProperties {
    todos?: Array<Todo.Item>;
    dispatch?(action: Redux.Action);
}

function mapStateToProps(state: Todo.State, props: TodoListProperties): TodoListProperties {
    let todos: Array<Todo.Item>;

    switch (state.visibilityFilter) {
        case 'active':
            todos = state.todos.filter(t => !t.completed);
            break;
        case 'completed':
            todos = state.todos.filter(t => t.completed);
            break;
        default:
            todos = state.todos;
    }

    return {
        todos
    }
}

@connect(mapStateToProps)
export class TodoList extends React.Component<TodoListProperties, ComponentState> {
    constructor() {
        super();
    }

    render() {
        const { dispatch, todos } = this.props;

        return (
            <div>
                {
                    todos.map((todo, idx) => (
                        <TodoItem
                            key={ idx }
                            {...todo}
                            text={ todo.text }
                            onClick={ () => {
                                dispatch(toggleTodo(idx));
                            } }
                        />
                    ))
                }
            </div>
        )
    }
}
