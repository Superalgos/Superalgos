import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { MuiPickersUtilsProvider } from 'material-ui-pickers'
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils'
import BrowseClones from './views/Clone/List'
import HistoryClones from './views/Clone/History'
import AddClone from './views/Clone/Add'
import Home from './views/Home'

const App = () => (
  <MuiPickersUtilsProvider utils={LuxonUtils}>
    <Switch>
      <Route exact path='/clones/' component={Home} />
      <Route path='/clones/browse' component={BrowseClones} />
      <Route path='/clones/history' component={HistoryClones} />
      <Route path='/clones/add' component={AddClone} />
    </Switch>
  </MuiPickersUtilsProvider>
)

export default App
