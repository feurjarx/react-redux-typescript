import * as React from "react";

export interface HeaderProperties {

}

export class Header extends React.Component<HeaderProperties, React.ComponentState> {
    constructor() {
        super();
    }

    render() {
        return (
            <header>Header Application</header>
        )
    }
}
