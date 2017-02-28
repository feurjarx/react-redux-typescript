import * as React from "react";
import * as ReactDOM from "react-dom";
import {App} from "./containers/App";
import {createStore} from "redux";
import {Provider} from "react-redux";
import {todoApp} from "./reducers";
// import AppContainer from "./containers/AppContainer";

const root = document.getElementById('root');
const store = createStore(todoApp);

function updateRender() {

    const jsxContainer = (
        // <AppContainer>
            <Provider store={ store }>
                <App />
            </Provider>
        // </AppContainer>
    );

    ReactDOM.render(jsxContainer, root);
}

if (module['hot']) {
    module['hot'].accept('./containers/App', () => {
        updateRender();
    });
}

updateRender();
