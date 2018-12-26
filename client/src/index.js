import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils'

import BrowseClones from './views/Clone/List'
import AddClone from './views/Clone/Add'
import Home from './views/Home'

const App = () => (
  <MuiPickersUtilsProvider utils={LuxonUtils}>
    <Switch>
      <Route exact path='/operations/' component={Home} />
      <Route path='/operations/browse' component={BrowseClones} />
      <Route path='/operations/add' component={AddClone} />
    </Switch>
  </MuiPickersUtilsProvider>
)

export default App
