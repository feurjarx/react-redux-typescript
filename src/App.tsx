import * as React from "react";

import {Header} from "./containers/Header";
import {Footer} from "./containers/Footer";
import {Content} from "./containers/Content";

export class App extends React.Component<any, any> {

    render() {
        return (
            <div className="app-container">
                <Header />
                <Content />
                <Footer />
            </div>
        )
    }
}
