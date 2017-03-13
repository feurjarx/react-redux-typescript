import * as React from "react";
import reactCSS from "reactcss"
import {Preparing} from "./preparing/Preparing";
import {Monitoring} from "./monitoring/Monitoring";
import {Stopwatch} from "./stopwatch/Stopwatch";

export class Content extends React.Component<any, React.ComponentState> {

    constructor() {
        super();
    }

    render() {

        return (
            <div style={ styles.base }>
                <Preparing />
                <Stopwatch />
                <Monitoring />
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
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'space-around'
        }
    }
});
