/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'
import MasterApp from './App'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers/rootReducer'

const store = createStore(rootReducer)

if (process.env.NODE_ENV !== 'production') {
  window.localStorage.setItem('debug', 'advanced-algos:*')
}

ReactDOM.render(
  <Provider store={store}>
    <MasterApp />
  </Provider>,
  document.getElementById('masterApp')
)
