import * as React from "react";
import * as Redux from "redux";
import {connect} from "react-redux";
import {addTodo} from "../actions/index";

export interface HeaderProperties {
    dispatch?(action: Redux.Action)
}

@connect()
export class Header extends React.Component<HeaderProperties, React.ComponentState> {
    constructor() {
        super();

        this.addTodoClick = this.addTodoClick.bind(this);
    }

    todoNameInput: HTMLInputElement;

    addTodoClick() {
        if (this.todoNameInput.value && this.todoNameInput.value.trim()) {
            const { dispatch } = this.props;
            dispatch(addTodo(this.todoNameInput.value));
        }
    }

    render() {

        return (
            <div>
                <header>Header Application</header>
                <p>
                    <label>Todo
                        <input type="text" ref={ el => this.todoNameInput = el }/>
                    </label>
                    <button onClick={ this.addTodoClick }>Add todo</button>
                </p>
            </div>
        )
    }
}
