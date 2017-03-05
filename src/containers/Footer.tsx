import * as React from "react";

export class Footer extends React.Component<any, React.ComponentState> {

    render() {

        const githubUrl = 'https://github.com/feurjarx/react-redux-typescript/tree/thesis';

        return (
            <footer>
                <div className="flexbox-aligned space-between">
                    <h4 className="developer">Яковенко Р. 8ИВТ-51</h4>
                    <a className="github-url" href={ githubUrl } target="_blank">
                        <i className="fa fa-2x fa-github"></i>
                    </a>
                </div>
            </footer>
        )
    }
}