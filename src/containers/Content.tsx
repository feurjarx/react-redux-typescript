import * as React from "react";
import {Preparing} from "./preparing/Preparing";
import ChartsTabs from "./tabs/ChartsTabs";

export class Content extends React.Component<any, any> {

    render() {

        return (
            <div style={ baseStyles }>
                <div style={{padding: 10}}>
                    <Preparing />
                </div>
                <ChartsTabs />
            </div>
        )
    }
}

const baseStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    alignItems: 'center'
};
