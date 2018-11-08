import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils';

import Search from './Components/Search';
import Events from './Components/Events';
import HostedEvents from './Components/HostedEvents';
import EditEvent from './Components/Event/Edit';
import CreateEvent from './Components/Event/Create';

const App = () => (
  <MuiPickersUtilsProvider utils={LuxonUtils}>
    <Switch>
      <Route exact path='/events/' component={Search} />
      <Route path='/events/my' component={Events} />
      <Route path='/events/create' component={CreateEvent} />
      <Route path='/events/edit/:slug' component={EditEvent} />
      <Route path='/events/show/:slug' component={EditEvent} />
      <Route path='/events/host' component={HostedEvents} />
    </Switch>
  </MuiPickersUtilsProvider>
);

export default App;
