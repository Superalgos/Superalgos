import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import { withStyles } from '@material-ui/core/styles'
import {
  AcceptTeamInvite,
  ManageTeams,
  TeamMembers,
  FinancialBeings,
  Settings,
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
    const { match } = this.props
    let loggedIn
    if (this.state.user !== null) {
      loggedIn = (<TeamBar match={match} user={this.state.user} />)
    } else {
      loggedIn = ''
    }
    return (
      <BrowserRouter>
        <div className='App'>
          {loggedIn}
          <Switch>
            <Route exact path={`${match.path}`} component={Teams} />
            <Route
              exact
              path={`${match.path}/manage-teams`}
              render={props => <ManageTeams {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/team-members`}
              render={props => <TeamMembers {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/financial-beings`}
              render={props => <FinancialBeings {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/financial-beings`}
              render={props => <Settings {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/activate-team-membership`}
              render={props => <AcceptTeamInvite {...props} auth={this.props.auth} />}
            />
            <Route path='/teams/:slug' component={Teams} />
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
