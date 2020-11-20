import { ApolloProvider } from 'react-apollo'
import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import { theme, globalStyles } from './styles'
import './styles/styles.scss'

import { client } from './graphql/apollo'
import Auth from './auth'

import { Layout, Home, Charts, Callback, EmailSignupConfirm } from './views'

import Users from '@superalgos/users-client'
import Teams from '@superalgos/teams-client'
import Events from '@superalgos/events-client'
import KeyVault from '@superalgos/key-vault-client'
import Operations from '@superalgos/operations-client'
import Strategizer from '@superalgos/strategizer-client'
import Logs from '@superalgos/logs-client'
import Cockpit from '@superalgos/cockpit-client'

export const auth = new Auth(
  result => console.log('Authentication successful.'),
  client
)

export const MasterApp = props => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Layout auth={auth}>
          <Switch>
            <Route exact path='/' component={Home} />
            <Route
              path='/callback'
              render={props => {
                return <Callback {...props} />
              }}
            />
            <Route
              path='/email-verification'
              render={props => {
                console.log(props.location)
                return (
                  <EmailSignupConfirm
                    {...props}
                    tokenParam={props.location.search}
                  />
                )
              }}
            />
            <Route
              path='/charts'
              render={props => <Charts {...props} auth={auth} />}
            />
            <Route
              path='/users'
              render={props => <Users {...props} auth={auth} />}
            />
            <Route
              path='/teams'
              render={props => <Teams {...props} auth={auth} />}
            />
            <Route
              path='/events'
              render={props => <Events {...props} auth={auth} />}
            />
            <Route
              path='/keys'
              render={props => <KeyVault {...props} auth={auth} />}
            />
            <Route
              path='/clones'
              render={props => <Operations {...props} auth={auth} />}
            />
            <Route
              path='/strategizer'
              render={props => <Strategizer {...props} auth={auth} />}
            />
            <Route
              path='/logs'
              render={props => <Logs {...props} auth={auth} />}
            />
            <Route
              path='/cockpit'
              render={props => <Cockpit {...props} auth={auth} />}
            />
          </Switch>
        </Layout>
      </MuiThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
)

const StyledMasterApp = withStyles(globalStyles)(MasterApp)
export default hot(module)(StyledMasterApp)
