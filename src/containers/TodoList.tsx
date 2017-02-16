import * as React from "react";
import ComponentState = React.ComponentState;
import {TodoItem} from "./TodoItem";

export interface TodoListProperties { }

export class TodoList extends React.Component<TodoListProperties, ComponentState> {
    constructor() {
        super();
    }

    render() {
        return (
            <div>
                {
                    ['Roman', 'Anna', 'Oleg', 'Nikolay', 'Natali', 'Vadim', 'Tatiyana'].map((name) => (
                        <TodoItem text={ name } />
                    ))
                }
            </div>
        )
    }
}
