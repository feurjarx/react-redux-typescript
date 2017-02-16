import * as React from "react";
import {Todo} from "../../typings/todo";

export interface TodoItemProperties extends Todo.Item {
    onClick?();
}

export class TodoItem extends React.Component<TodoItemProperties, any> {
    constructor() {
        super();
    }

    render() {
        return (
            <h1>{ this.props.text }</h1>
        )
    }
}
