import * as React from "react";
import { TextField } from "material-ui"
import reactCSS from "reactcss"

export class Content extends React.Component<any, React.ComponentState> {
    constructor() {
        super();
    }


    render() {
        return (
            <div style={ styles.base }>
                <TextField floatingLabelText="Введите количество клиентов"/>
                <TextField floatingLabelText="Введите количество серверов"/>
            </div>
        )
    }
}

const styles = reactCSS({
    default: {
        base: {
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
        }
    }
});
