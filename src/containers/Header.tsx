import * as React from "react";
import { Toolbar, ToolbarGroup } from 'material-ui'

export class Header extends React.Component<any, React.ComponentState> {
    constructor() {
        super();
    }

    render() {

        return (
            <header>
                <h1 className="text-center margin-none">Моделирование</h1>
            </header>
        )
    }
}