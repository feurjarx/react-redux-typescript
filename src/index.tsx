import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./App";

// custom styles
import './../resources/styles/common.css'
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';

// store
import {Provider} from "react-redux";
import configureStore from "./configureStore";
const store = configureStore();

// material-ui
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
require("react-tap-event-plugin")();

function updateRender() {
    ReactDOM.render(
        <MuiThemeProvider>
            <Provider store={ store }>
                <App />
            </Provider>
        </MuiThemeProvider>,
        document.getElementById('root')
    );
}

if (module['hot']) {
    module['hot'].accept('./App', () => {
        updateRender();
    });
}

updateRender();
