import { ApolloProvider } from 'react-apollo'
import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import { theme, globalStyles } from './styles'

import { client } from './graphql/apollo'
import Auth from './auth'

import { Header, Footer, Home, Callback } from './views'

import Teams from '@advancedalgos/teams-client'
import KeyVault from '@advancedalgos/key-vault-client'
import Users from '@advancedalgos/users-client'

export const auth = new Auth(
  result => console.log('auth result', result),
  client
)

export const MasterApp = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <div className='App'>
          <Header auth={auth} />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route
              path='/callback'
              render={props => {
                auth.handleAuthentication(props)
                return <Callback {...props} />
              }}
            />
            <Route
              exact
              path='/teams'
              render={props => <Teams {...props} auth={auth} />}
            />
            <Route
              exact
              path='/keys'
              render={props => <KeyVault {...props} />}
            />
            <Route
              exact
              path='/users'
              render={props => <Users {...props} auth={auth} />}
            />
          </Switch>
          <Footer />
        </div>
      </MuiThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
)

const StyledMasterApp = withStyles(globalStyles)(MasterApp)
export default hot(module)(StyledMasterApp)
