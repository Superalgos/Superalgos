import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils';

import { getItem } from './utils/local-storage';

import TopBar from './Components/TopBar';
import Search from './Components/Search';
import Events from './Components/Events';
import HostedEvents from './Components/HostedEvents';
import EditEvent from './Components/Event/Edit';
import CreateEvent from './Components/Event/Create';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  async componentDidMount() {
    let user = await getItem('user');

    if (user !== null && user !== undefined && user !== 'undefined') {
      user = JSON.parse(user);
      this.setState({ user });
    }
  }

  render() {
    let loggedIn;
    if (this.state.user !== null) {
      loggedIn = (<TopBar match={this.props.match} user={this.state.user} />);
    } else {
      loggedIn = '';
    }
    return (
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        {loggedIn}
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
  }
}

export default App;
