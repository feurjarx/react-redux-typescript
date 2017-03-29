import * as React from "react";
import lifeConfig from "../../configs/life";

const syntaxConfig = require('../../configs/syntax.json');
import InfoSlider from '../../components/info-slider/InfoSlider';
import Paper from 'material-ui/Paper'
import FormDataService from "../../services/FormData";

const CodeMirror = require('codemirror');
require('codemirror/mode/sql/sql.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/sql-hint.js');
require('codemirror/addon/selection/active-line.js');
require('codemirror/addon/edit/matchbrackets.js');
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
// import 'codemirror/theme/ambiance.css'
import 'codemirror/theme/eclipse.css'

const hljs = require('highlight.js');

const codeMirrorConfig = {
    mode: 'text/x-mariadb',
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets : true,
    styleActiveLine: true,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    hintOptions: {
        tables: {
            users: {name: null, score: null, birthDate: null},
            countries: {name: null, population: null, size: null}
        }
    },
    // theme: 'ambiance'
    theme: 'eclipse'
};

export class RequestsSettingsStep extends React.Component<any, any> {

    fds: FormDataService;

    state = {
        nClients: lifeConfig.nClients,
        nServers: lifeConfig.nServers,
        requestsLimit: lifeConfig.requestsLimit,
        requestTimeLimit: lifeConfig.requestTimeLimit
    };

    constructor(props) {
        super();

        const {formDataService} = props;
        formDataService.setData(Object.assign({}, this.state));
        this.fds = formDataService;
    }

    handleFormChange = (event) => {
        const { target } = event;

        this.setState({
            [target.name]: target.value
        }, () => {
            this.fds.setDataByPath(target.name, target.value);
        });
    };

    handleSlidersChange = (v: number, name: string) => {
        this.setState({
            [name]: v
        }, () => {
            this.fds.setDataByPath(name, v);
        });
    };

    componentDidMount() {
        const {sqlbox} = this.refs;
        // hljs.highlightBlock(sqlbox);
        CodeMirror.fromTextArea(sqlbox, codeMirrorConfig);
    }

    render() {

        const {
            handleFormChange,
            handleSlidersChange
        } = this;

        const {
            nClients,
            requestsLimit,
            requestTimeLimit,
        } = this.props;

        return (

            <form onChange={ handleFormChange } id="life-data-form">

                <Paper style={{padding: 25, minWidth: 300}} zDepth={3}>

                    <div id="clients-settings-block" className="v-internal-interval-10">

                        <InfoSlider
                            name="nClients"
                            syntax={syntaxConfig['client']}
                            min={1}
                            defaultValue={ nClients }
                            onChange={ handleSlidersChange }
                        />

                        <InfoSlider
                            label="Лимит клиента"
                            name="requestsLimit"
                            syntax={syntaxConfig['request']}
                            min={1}
                            defaultValue={ requestsLimit }
                            onChange={ handleSlidersChange }
                        />

                        <InfoSlider
                            label="Лимит сложности запроса"
                            name="requestTimeLimit"
                            shortSyntax=""
                            min={1}
                            max={10000}
                            defaultValue={ requestTimeLimit }
                            onChange={ handleSlidersChange }
                        />
                    </div>
                </Paper>
                <div id="sqlbox-block">
                    <textarea
                        ref="sqlbox"
                        defaultValue="SELECT * FROM user AS u WHERE u.id > 1000"
                    />
                </div>
                <div id="json-display-block">
                    <JsonDisplay raw="{a: 2}"/>
                </div>
            </form>
        )
    }
}
export default RequestsSettingsStep;

const JsonDisplay = (props) => {

    const {raw} = props;

    return (
        <pre><code className="json">{raw}</code></pre>
    );
};