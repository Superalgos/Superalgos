import React, { Component } from 'react';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';

import { Route, BrowserRouter, Switch } from 'react-router-dom';

// Components

import NavBar from './components/NavBar';

import Home from './components/Home';
import User from './components/User';
import Browse from './components/Browse';
import Search from './components/Search';
import About from './components/About';
import Contact from './components/Contact';
import Logout from './components/Logout';
import Post from './components/Post';
import Footer from './components/Footer';
import Callback from './components/Callback';

import Auth from './auth/Auth';

// Apollo Client Setup
const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql', changeOrigin: true })

const errorLink= onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
})

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
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache()
})

/*
export const client = new ApolloClient({
  uri:'http://localhost:4000/graphql'
})
*/

export const auth = new Auth(result => console.log('auth result', result), client);

class App extends Component {
  render() {

    return (
      <BrowserRouter>
        <ApolloProvider client={client}>

          <div className="App">
            <NavBar/>
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route path='/user' component={User} />
              <Route path='/browse' component={Browse} />
              <Route path='/search' component={Search} />
              <Route path='/about' component={About} />
              <Route path='/contact' component={Contact} />
              <Route path='/logout' component={Logout} />
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
