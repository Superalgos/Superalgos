import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

const Base = () => (
  <p>
    base website
  </p>
)

const Added = () => (
  <p>
    added website
  </p>
)

class App extends Component {
  render () {
    return (
      <BrowserRouter basename={window.location.pathname}>
        <Switch>
          <p>{window.location.pathname}</p>
          <Route exact path='/' component={Base} />
          <Route path='/added' component={Added} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
