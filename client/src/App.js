import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';

import { Route, BrowserRouter, Switch } from 'react-router-dom'

// Components

import Navbar from './components/Navbar'
import Home from './components/Home'
import Profile from './components/Profile'
import Browse from './components/Browse'
import Search from './components/Search'
import About from './components/About'
import Contact from './components/Contact'
import Post from './components/Post'
import Footer from './components/Footer'

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
              <Route path='/profile' component={Profile} />
              <Route path='/browse' component={Browse} />
              <Route path='/search' component={Search} />
              <Route path='/about' component={About} />
              <Route path='/contact' component={Contact} />
              <Route path='/:post_id' component={Post} />
            </Switch>
            <Footer/>
          </div>

        </ApolloProvider>
      </BrowserRouter>
    );
  }
}

export default App;
