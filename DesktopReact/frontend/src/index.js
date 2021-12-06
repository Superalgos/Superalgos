import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import reducers from "./store";
import Root from "./components/Root";



ReactDOM.render(
    <React.StrictMode>
        <Provider store={reducers}>
            <Root/>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
