import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';

import Navbar from './components/Navbar'
import { Route, BrowserRouter, Switch } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import Post from './components/Post'

// Components

import UserList from './components/UserList';
import AddUser from './components/AddUser';

// Apollo Client Setup

const client = new ApolloClient({
  uri:'http://localhost:4000/graphql'
})

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={client}>

          <div className="App">
            <Navbar />
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route path='/about' component={About} />
              <Route path='/contact' component={Contact} />
              <Route path='/:post_id' component={Post} />
            </Switch>
          </div>

          <div id="main">
            <h1>Advanced Algos - Users Module</h1>
            <UserList/>
            <AddUser/>
          </div>
        </ApolloProvider>
      </BrowserRouter>
    );
  }
}

export default App;
