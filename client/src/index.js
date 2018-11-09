import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils'

import Home from './components/Home'
import User from './components/User'
import Browse from './components/Browse'
import Search from './components/Search'

const App = () => (
  <MuiPickersUtilsProvider utils={LuxonUtils}>
    <Switch>
      <Route exact path='/users/' component={Home} />
      <Route path='/users/user' component={User} />
      <Route path='/users/browse' component={Browse} />
      <Route path='/users/search' component={Search} />
    </Switch>
  </MuiPickersUtilsProvider>
)

export default App

