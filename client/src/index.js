import React, { Component } from 'react'

import { Route, BrowserRouter, Switch } from 'react-router-dom'

// Material UI

import { MuiThemeProvider } from '@material-ui/core/styles'
import theme from './theme'

// Components
import NavBar from './components/NavBar'
import Home from './components/Home'
import User from './components/User'
import Browse from './components/Browse'
import Search from './components/Search'
import About from './components/About'
import Contact from './components/Contact'

class App extends Component {
  render () {
    return (
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <NavBar />
          <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/user' component={User} />
            <Route path='/browse' component={Browse} />
            <Route path='/search' component={Search} />
            <Route path='/about' component={About} />
            <Route path='/contact' component={Contact} />
          </Switch>
        </MuiThemeProvider>
      </BrowserRouter>
    )
  }
}

export default App
