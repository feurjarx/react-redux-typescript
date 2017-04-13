import * as React from "react";
import Stopwatch from "../containers/stopwatch/Stopwatch";

export class Footer extends React.Component<any, React.ComponentState> {

    render() {

        const githubUrl = 'https://github.com/feurjarx/react-redux-typescript';

        return (
            <footer>
                <div className="flex-aligned space-between">
                    <h4 className="developer">Яковенко Р. 8ИВТ-51</h4>
                    <Stopwatch />
                    <a className="github-url" href={ githubUrl } target="_blank">
                        <i className="fa fa-2x fa-github"></i>
                    </a>
                </div>
            </footer>
        )
    }
}