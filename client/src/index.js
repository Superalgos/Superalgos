import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import { withStyles } from '@material-ui/core/styles'
import {
  AcceptTeamInvite,
  ManageTeams,
  TeamMembers,
  Settings,
  Teams,
  Landing,
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
    return (
      <div className='App'>
        <Switch>
          <Route exact path={`/teams`} component={Landing} />
          <Route exact path={`/teams/explore`} component={Teams} />
          <Route
            exact
            path={`/teams/manage-teams`}
            render={props => <ManageTeams {...props} auth={this.props.auth} />}
          />
          <Route
            exact
            path={`/teams/manage-teams/:slug`}
            render={props => <ManageTeams {...props} auth={this.props.auth} user={this.state.user} />}
          />
          <Route
            exact
            path={`/teams/team-members`}
            render={props => <TeamMembers {...props} auth={this.props.auth} />}
          />
          <Route
            exact
            path={`/teams/settings`}
            render={props => <Settings {...props} auth={this.props.auth} />}
          />
          <Route
            exact
            path={`/teams/activate-team-membership`}
            render={props => <AcceptTeamInvite {...props} auth={this.props.auth} />}
          />
          <Route exact path='/teams/:slug' component={Teams} />
        </Switch>
      </div>
    )
  }
}

App.propTypes = {
  auth: PropTypes.object
}

const StyledApp = withStyles(globalStyles)(App)
export default hot(module)(StyledApp)
