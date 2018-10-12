/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'
import MasterApp from './App'

if (process.env.NODE_ENV !== 'production') {
  localStorage.setItem('debug', 'advanced-algos:*')
}

ReactDOM.render(<MasterApp />, document.getElementById('root'))
