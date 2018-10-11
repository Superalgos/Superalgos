/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'

import MasterApp from './App'

if (process.env.NODE_ENV !== 'production') {
  localStorage.setItem('debug', 'advanced-algos:*')
}

ReactDOM.render(<MasterApp />, document.getElementById('root'))

let frontendReloadCount = 0

if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept()

    module.hot.accept('./index', () => {
      try {
        log.debug('Updating front-end')
        frontendReloadCount = (frontendReloadCount || 0) + 1
      } catch (err) {
        log(err.stack)
      }
    })
  }
}
