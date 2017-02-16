import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./containers/App";

const root = document.getElementById('root');

function updateRender() {
    // const App = require('./containers/App').App;
    ReactDOM.render(<App/>, root);
}

updateRender();

if (module['hot']) {
    module['hot'].accept('./components', () => updateRender());
}