import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./containers/App";

// custom styles
import './../resources/styles/common.css'

// vendor styles
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';

// redux
import {createStore} from "redux";
import {Provider} from "react-redux";
import {todoApp} from "./reducers";

// material-ui
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require("react-tap-event-plugin")();

const root = document.getElementById('root');
const store = createStore(todoApp);

function updateRender() {

    const jsxContainer = (
        <MuiThemeProvider>
            <Provider store={ store }>
                <App />
            </Provider>
        </MuiThemeProvider>
    );

    ReactDOM.render(jsxContainer, root);
}

if (module['hot']) {
    module['hot'].accept('./containers/App', () => {
        updateRender();
    });
}

updateRender();
