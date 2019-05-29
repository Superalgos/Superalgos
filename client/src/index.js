/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'
import MasterApp from './App'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers/rootReducer'
import { setInitialEcosystem } from './utils/ecosystem'

const store = createStore(rootReducer)

if (process.env.NODE_ENV !== 'production') {
  window.localStorage.setItem('debug', 'advanced-algos:*')
}

setInitialEcosystem()

ReactDOM.render(
  <Provider store={store}>
    <MasterApp />
  </Provider>,
  document.getElementById('masterApp')
)
