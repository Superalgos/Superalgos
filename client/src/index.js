import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import {
  AcceptTeamInvite,
  Dashboard,
  Teams,
  globalStyles
} from './views'

class App extends Component {
  render () {
    return (
      <BrowserRouter basename={window.location.pathname}>
        <div className='App'>
          <Switch>
            <Route exact path='/' component={Teams} />
            <Route exact path='/:slug' component={Teams} />
            <Route
              exact
              path='/(dashboard|manage-teams|team-members|financial-beings|settings)/'
              render={props => <Dashboard {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path='/activate-team-membership'
              render={props => <AcceptTeamInvite {...props} auth={this.props.auth} />}
            />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

App.propTypes = {
  auth: PropTypes.object
}

export default withStyles(globalStyles)(App)
