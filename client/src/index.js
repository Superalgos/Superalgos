/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

import log from '../tools/log'

ReactDOM.render(<App />, document.getElementById('root'))

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
