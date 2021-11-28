import React from 'react';
import {Provider} from "react-redux";
import reducers from "../store";
import Root from "./Root";

const ReactBase = () => {
    return (
        <React.StrictMode>
            <Provider store={reducers}>
                <Root/>
            </Provider>
        </React.StrictMode>
    );
};

export default ReactBase;
