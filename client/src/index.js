import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import { withStyles } from '@material-ui/core/styles'
import {
  AcceptTeamInvite,
  Dashboard,
  Teams,
  TeamBar,
  globalStyles
} from './views'

import { getItem } from './utils/local-storage'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null
    }
  }

  async componentDidMount () {
    let user = await getItem('user')

    if (user !== null && user !== undefined && user !== 'undefined') {
      user = JSON.parse(user)
      this.setState({ user: user })
    }
  }

  render () {
    let loggedIn
    if (this.state.user !== null) {
      loggedIn = (<TeamBar user={this.state.user} />)
    } else {
      loggedIn = ''
    }
    return (
      <BrowserRouter basename={window.location.pathname}>
        <div className='App'>
          {loggedIn}
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

const StyledApp = withStyles(globalStyles)(App)
export default hot(module)(StyledApp)
