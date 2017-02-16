import * as React from "react";

export interface FooterProperties {

}

export class Footer extends React.Component<FooterProperties, React.ComponentState> {
    constructor() {
        super();
    }

    render() {
        return (
            <footer>Footer Application</footer>
        )
    }
}
