import * as React from "react";
import reactCSS from "reactcss"
import {Preparing} from "../components/preparing/Preparing";
import {Monitoring} from "../components/monitoring/Monitoring";

export class Content extends React.Component<any, React.ComponentState> {

    constructor() {
        super();
    }

    render() {

        return (
            <div style={ styles.base }>
                <Preparing />
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
