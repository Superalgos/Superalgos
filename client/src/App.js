import { ApolloProvider } from 'react-apollo'
import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import { theme, globalStyles } from './styles'

import { client } from './graphql/apollo'
import Auth from './auth'

import { Header, Footer, Home, Callback } from './views'

import Teams from '@advancedalgos/teams-client'
import KeyVault from '@advancedalgos/key-vault-client'

export const auth = new Auth(
  result => console.log('auth result', result),
  client
)
console.log(Header)
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
              exact
              path='/teams'
              render={props => <Teams {...props} auth={auth} />}
            />
            <Route exact path='/key-vault' component={KeyVault} />
          </Switch>
          <Footer />
        </div>
      </MuiThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
)

export default withStyles(globalStyles)(MasterApp)
