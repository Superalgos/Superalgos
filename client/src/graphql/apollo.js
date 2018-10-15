import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, Observable } from 'apollo-link'
import { onError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'

import { getItem } from '../utils/local-storage'

const graphqlEndpoint =
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_GRAPHQL
    : process.env.DEV_GRAPHQL

const httpLink = new HttpLink({ uri: graphqlEndpoint })

const authRetryLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      // User access token has expired
      // console.log('authLink: ', graphQLErrors) // check for error message to intercept and resend with Auth0 access token
      if (graphQLErrors[0].message === 'Not logged in') {
        // We assume we have auth0 access token needed to run the async request
        // Let's refresh token through async request
        return new Observable(observer => {
          getItem('access_token')
            .then(accessToken => {
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  // Re-add old headers
                  ...headers,
                  // Switch out old access token for new one
                  Authorization: `Bearer ${accessToken}` || null
                }
              }))
            })
            .then(() => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer)
              }

              // Retry last failed request
              forward(operation).subscribe(subscriber)
            })
            .catch(error => {
              // No auth0 access token available, we force user to login
              observer.error(error)
            })
        })
      }
    }
  }
)

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('access_token')
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ``
    }
  }
})

const cache = new InMemoryCache().restore(window.__APOLLO_STATE__)

export const client = new ApolloClient({
  link: ApolloLink.from([authRetryLink, authLink, httpLink]), // replaced link with httpLink
  cache,
  connectToDevTools: true
})
