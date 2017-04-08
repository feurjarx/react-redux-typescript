import * as React from "react";
import {Preparing} from "./preparing/Preparing";
import ChartsTabs from "./tabs/ChartsTabs";
import LogsDrawer from "./logs-drawer/LogsDrawer";

export class Content extends React.Component<any, any> {

    render() {

        return (
            <div style={baseStyles}>
                <div className="flex-row" style={{padding: 10}}>
                    <Preparing />
                    <LogsDrawer />
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
