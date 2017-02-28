import * as React from "react";
import {Todo} from "../../typings/todo";

export interface TodoItemProperties extends Todo.Item {
    onClick?();
}

export class TodoItem extends React.Component<TodoItemProperties, any> {

    render() {

        const {text, completed, onClick} = this.props;

        const todoStyle = {
            color: completed ? 'green' : 'black',
            cursor: 'pointer'
        };

        return (
            <div>
                <h1 style={ todoStyle } onClick={ onClick }>
                    { text }
                </h1>
            </div>
        )
    }
}
