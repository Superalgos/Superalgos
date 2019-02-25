import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils';

import Search from './Components/Search';
import HostedEvents from './Components/HostedEvents';
import EditEvent from './Components/Event/Edit';
import ShowEvent from './Components/Event/Show';
import CreateEvent from './Components/Event/Create';

import './styles.scss';

const App = () => (
  <MuiPickersUtilsProvider utils={LuxonUtils}>
    <div className='eventsModule'>
      <Switch>
        <Route exact path='/events/' component={Search} />
        <Route path='/events/create' component={CreateEvent} />
        <Route path='/events/edit/:slug' component={EditEvent} />
        <Route path='/events/show/:slug' component={ShowEvent} />
        <Route path='/events/host' component={HostedEvents} />
      </Switch>
    </div>
  </MuiPickersUtilsProvider>
);

export default App;
