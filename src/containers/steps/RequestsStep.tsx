import * as React from "react";
import * as ReactDOM from "react-dom";
import lifeConfig from "../../configs/life";

const syntaxConfig = require('../../configs/syntax.json');
import InfoSlider from '../../components/info-slider/InfoSlider';
import Paper from 'material-ui/Paper'
import FormDataService from "../../services/FormData";
import SqlParseService from "../../services/SqlParseService";

const CodeMirror = require('codemirror');
require('codemirror/mode/sql/sql.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/sql-hint.js');
require('codemirror/addon/selection/active-line.js');
require('codemirror/addon/edit/matchbrackets.js');
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
// import 'codemirror/theme/ambiance.css'
import 'codemirror/theme/eclipse.css';

const hljs = require('highlight.js');
hljs.initHighlightingOnLoad();

import 'highlight.js/styles/default.css';

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

export class RequestsStep extends React.Component<any, any> {

    fds: FormDataService;

    defaultSql = (`
SELECT id,name, tel, contact.id
FROM user AS u
JOIN contact AS c ON c.id = user.contact_id 
WHERE u.id > 1000 AND u.name IN ("Ivan", "Alex")
GROUP BY u.id,u.name
OFFSET 5
LIMIT 10
    `).trim();

    state = {
        nClients: lifeConfig.nClients,
        nServers: lifeConfig.nServers,
        requestsLimit: lifeConfig.requestsLimit,
        requestTimeLimit: lifeConfig.requestTimeLimit,
        displayValue: '',
        cmInited: false
    };

    constructor(props) {
        super();

        const {formDataService} = props;
        formDataService.setData(Object.assign({}, this.state));
        this.fds = formDataService;
    }

    sqlToJson(sql: string) {
        const sqlItems = sql
            .split(';')
            .map(q => SqlParseService.sqlQuery2Json(q));

        return JSON.stringify(sqlItems, null, 2);
    }

    updateDisplay = (displayValue) => {
        const jsonDisplayBlock = this.refs['jsonDisplayBlock'] as HTMLElement;
        const jsonDisplayElem = jsonDisplayBlock.querySelector('.JSON');
        this.setState({displayValue}, () => (
            hljs.highlightBlock(ReactDOM.findDOMNode(jsonDisplayElem))
        ));
    };

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

    codeMirrorInit = () => {
        const {sqlbox} = this.refs;
        const {onTextareaKeyUp,fds} = this;
        const editor = CodeMirror.fromTextArea(sqlbox, codeMirrorConfig);
        editor.on('change', onTextareaKeyUp);

        const {updateDisplay, sqlToJson, defaultSql} = this;

        const sqls = sqlToJson(defaultSql);
        fds.data.sqls = JSON.parse(sqls);
        updateDisplay(sqls);
    };

    onTextareaKeyUp = (editor) => {
        const {updateDisplay, sqlToJson, fds} = this;
        const sqls = sqlToJson(editor.getValue());
        fds.data.sqls = JSON.parse(sqls);
        updateDisplay(sqls);
    };

    componentWillReceiveProps(props) {
        let {cmInited} = this.state;
        if (props.active && !cmInited) {
            cmInited = true
            this.codeMirrorInit();
            this.setState({cmInited});
        }
    }

    render() {

        const {
            defaultSql,
            onTextareaKeyUp,
            handleFormChange,
            handleSlidersChange
        } = this;

        const {
            nClients,
            requestsLimit,
            requestTimeLimit,
        } = this.props;

        const {displayValue} = this.state;

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
                    <textarea onKeyUp={onTextareaKeyUp}
                        ref="sqlbox"
                        defaultValue={defaultSql}
                    />
                </div>
                <div id="json-display-block" ref="jsonDisplayBlock">
                    <JsonDisplay raw={displayValue}/>
                </div>
            </form>
        )
    }
}
export default RequestsStep;

const JsonDisplay = (props) => {

    const {raw} = props;

    return (
        <pre><code className="JSON">{raw}</code></pre>
    );
};