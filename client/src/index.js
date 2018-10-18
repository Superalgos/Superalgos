import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

const Base = () => (
  <p>
    Base component
  </p>
)

const Added = () => (
  <p>
    Added component
  </p>
)

class App extends Component {
  render () {
    return (
      <BrowserRouter basename={this.props.match.path}>
        <Switch>
          <Route exact path='/' component={Base} />
          <Route path='/added' component={Added} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App
