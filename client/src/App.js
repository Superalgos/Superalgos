import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context';

import { Route, BrowserRouter, Switch } from 'react-router-dom'

// Components

import ButtonAppBar from './components/Material-UI/ButtonAppBar'

import Home from './components/Home'
import Profile from './components/Profile'
import Browse from './components/Browse'
import Search from './components/Search'
import About from './components/About'
import Contact from './components/Contact'
import Post from './components/Post'
import Footer from './components/Footer'
import Callback from './components/Callback'

import Auth from './auth/index'

/*
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql', changeOrigin: true })
// Apollo Client Setup

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('access_token')
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ``
    }
  }
})

export const client = new ApolloClient({
  link: httpLink
})
*/

export const client = new ApolloClient({
  uri:'http://localhost:4000/graphql'
})

export const auth = new Auth(result => console.log('auth result', result), client);

class App extends Component {
  render() {

    return (
      <BrowserRouter>
        <ApolloProvider client={client}>

          <div className="App">
            <ButtonAppBar/>
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route path='/profile' component={Profile} />
              <Route path='/browse' component={Browse} />
              <Route path='/search' component={Search} />
              <Route path='/about' component={About} />
              <Route path='/contact' component={Contact} />
              <Route path='/:post_id' component={Post} />
              <Route path='/callback' render={(props) => {
                auth.handleAuthentication(props)
                return <Callback {...props} />
              }}/>
            </Switch>
            <Footer/>
          </div>

        </ApolloProvider>
      </BrowserRouter>
    );
  }
}

export default App;
