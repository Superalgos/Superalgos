import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
// import {SA, UI} from '../UI/Globals';
// import {loadSuperalgos} from '../UI/WebAppPreLoader'
import {Provider} from "react-redux";
import reducers from "./store";
import Root from "./components/Root";

// const store = createStore(reducers); 


// loadSuperalgos();
// console.log(UI);
// console.log(SA);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={reducers}>
            <Root/>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
