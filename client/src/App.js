import React, { Component } from 'react';

// Components

import UserList from './components/UserList';

class App extends Component {
  render() {
    return (
      <div id="main">
        <h1>Advanced Algos - Users Module</h1>
        <UserList></UserList>
      </div>
    );
  }
}

export default App;
