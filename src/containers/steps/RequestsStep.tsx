import * as React from "react";
import * as ReactDOM from "react-dom";

const syntaxConfig = require('../../configs/syntax.json');
import InfoSlider from '../../components/info-slider/InfoSlider';
import Paper from 'material-ui/Paper'
import FormDataService from "../../services/FormDataService";
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
SELECT name, year FROM user;
SELECT name, year FROM user AS u WHERE u.name = 'abc';
SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.email = 'abc';
SELECT name, year FROM user AS u WHERE u.name = 'abc' OR u.tel = 9;
SELECT * FROM user AS u WHERE u.name = 'abc';

SELECT * FROM session AS s WHERE s.created_at > 1491923854;
SELECT user_id FROM session AS s WHERE status = 'abc';
SELECT status, user_id FROM session AS s WHERE s.expired_at = 9;

SELECT favourite_title FROM playlist AS p WHERE p.isFavourite = 1;
SELECT * FROM playlist AS p WHERE p.created_at > 1491923854;
SELECT name, description FROM playlist AS p WHERE p.created_at > 1491923854;
SELECT name, description FROM playlist AS p WHERE p.name IN ('abc', 'bca', 'ccc');

`).trim();

    getDefaultRequestsData() {
        return {
            nClients: 15,
            requestsLimit: 13,
            requestTimeLimit: 10,
        }
    };

    constructor(props) {
        super();

        const {formDataService} = props;

        const defaultData = this.getDefaultRequestsData();

        this.state = {
            ...defaultData,
            displayValue: '',
            cmInited: false
        };

        const fdsData = formDataService.data;

        formDataService.setData({
            ...fdsData,
            ...defaultData
        });

        this.fds = formDataService;
    }

    sqlToJson(sql: string) {
        const sqlItems = sql
            .split(';')
            .filter(q => Object.keys(q).length)
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
        const {onTextareaKeyUp, fds} = this;
        const editor = CodeMirror.fromTextArea(sqlbox, codeMirrorConfig);
        editor.on('change', onTextareaKeyUp);

        const sqls = this.sqlToJson(this.defaultSql);
        fds.data.sqls = JSON.parse(sqls);
        this.updateDisplay(sqls);
    };

    private timerId;
    onTextareaKeyUp = (editor) => {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            const {updateDisplay, sqlToJson, fds} = this;
            const sqls = sqlToJson(editor.getValue());
            fds.data.sqls = JSON.parse(sqls);
            updateDisplay(sqls);
        }, 1000);
    };

    componentWillReceiveProps(props) {
        let {cmInited} = this.state;
        if (props.active && !cmInited) {
            cmInited = true;
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
        } = this.getDefaultRequestsData();

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
                            label="Timeout"
                            name="requestTimeLimit"
                            shortSyntax=""
                            min={1}
                            max={10000}
                            defaultValue={ requestTimeLimit }
                            onChange={ handleSlidersChange }
                        />

                        {/*
                         <InfoSlider
                             label="Объем данных"
                             name="dbSize"
                             shortSyntax="Гб"
                             min={1}
                             max={10000}
                             defaultValue={ 1000 }
                             onChange={handleSlidersChange}
                         />
                        */}
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