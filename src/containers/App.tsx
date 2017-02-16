import * as React from "react";
import {Header} from "./Header";
import {TodoList} from "./TodoList";
import {Footer} from "./Footer";

export interface AppProperties { }

export interface AppState { }

export class App extends React.Component<AppProperties, AppState> {
    constructor() {
        super();
    }

    render() {
        return (
            <div>
                <Header />
                <TodoList />
                <Footer />
            </div>
        )
    }
}
