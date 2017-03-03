import * as React from "react";
import { CardHeader } from 'material-ui'

export class Header extends React.Component<any, React.ComponentState> {
    constructor() {
        super();
    }

    render() {

        return (
            <header>
                <CardHeader title="Моделирование" subtitle="СМО"/>
            </header>
        )
    }
}