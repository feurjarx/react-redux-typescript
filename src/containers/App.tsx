import * as React from "react";

import {Header} from "./Header";
import {Footer} from "./Footer";
import {Content} from "./Content";

export interface AppProperties { }

export interface AppState { }

export class App extends React.Component<AppProperties, AppState> {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="app-container">
                {/*<Header />*/}
                <Content />
                <Footer />
            </div>
        )
    }
}