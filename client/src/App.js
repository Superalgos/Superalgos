import { ApolloProvider } from 'react-apollo'
import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import { theme, globalStyles } from './styles'

import { client } from './graphql/apollo'
import Auth from './auth'

import { Header, Footer, Home, Charts, Callback } from './views'

import Users from '@advancedalgos/users-client'
import Teams from '@advancedalgos/teams-client'
import Events from '@advancedalgos/events-client'
import KeyVault from '@advancedalgos/key-vault-client'

// The following are the style sheets needed for the Header, Responsive Menu, and Footer. It also impacts html at the body.
import '../css/bootstrap.css'
import '../css/saira.css'
import '../css/shortcodes.css'
import '../css/responsive.css'
import '../css/fontawesome.css'
import '../css/general.css'
import '../css/fonts.css'

export const auth = new Auth(
  result => console.log('Authentication successful.'),
  client
)

export const MasterApp = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
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
            path='/key-vault'
            render={props => <KeyVault {...props} auth={auth} />}
            />
        </Switch>
        <Footer />
      </MuiThemeProvider>
    </ApolloProvider>
  </BrowserRouter>
)

const StyledMasterApp = withStyles(globalStyles)(MasterApp)
export default hot(module)(StyledMasterApp)
