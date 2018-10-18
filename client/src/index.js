import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import { withStyles } from '@material-ui/core/styles'

// Components
import NavBar from './components/NavBar'
import Home from './components/Home'
import User from './components/User'
import Browse from './components/Browse'
import Search from './components/Search'
import About from './components/About'
import Contact from './components/Contact'

import { getItem } from './utils/local-storage'
import {
  globalStyles
} from './theme'

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

    return (
      <BrowserRouter>
        <div className='App'>
          <NavBar match={match} user={this.state.user} />
          <Switch>
            <Route exact path={`${match.path}`} component={Home} />
            <Route
              exact
              path={`${match.path}/users`}
              render={props => <Home {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/user`}
              render={props => <User {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/browse`}
              render={props => <Browse {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/search`}
              render={props => <Search {...props} auth={this.props.auth} />}
            />
            <Route
              exact
              path={`${match.path}/about`}
              render={props => <About {...props} auth={this.props.auth} />}
            />
            <Route path='/browse/:slug' component={Browse} />
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
