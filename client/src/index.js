import React, { Component } from 'react';
import { Route, BrowserRouter, Switch } from 'react-router-dom';

import { MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from 'material-ui-pickers/utils/luxon-utils';

import { getItem } from './utils/local-storage';

import TopBar from './Components/TopBar';
import Search from './Components/Search';
import Events from './Components/Events';
import HostedEvents from './Components/HostedEvents';
import EditEvent from './Components/Event/Edit';

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
        <BrowserRouter basename={this.props.match.path}>
          <div>
            {loggedIn}
            <Switch>
              <Route exact path='/' component={Search} />
              <Route path='/my' component={Events} />
              <Route path='/exact/:slug' component={EditEvent} />
              <Route path='/show/:slug' component={EditEvent} />
              <Route path='/host' component={HostedEvents} />
            </Switch>
          </div>
        </BrowserRouter>
      </MuiPickersUtilsProvider>
    );
  }
}

export default App;
