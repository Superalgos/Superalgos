### Auth0 Integration

[Auth0](https://auth0.com/) is a third-party service that simplifies integrating authentication into a web application.

The main use of Auth0 will be for [Oauth 2.0](https://auth0.com/docs/protocols/oauth2) authentication requesting an [*implicit grant*](https://tools.ietf.org/html/rfc6749#section-1.3.2) flow. Auth0 also hosts the login/oauth authentication forms.

While Auth0 provides a depth of user-security services such as authorization (scopes/roles), multi-factor authentication, currently only basic authentication will be used.

#### Auth0 Function Flow
![Auth0 Function Flow](./assets/AATeamAuth0FunctionFlow.svg)

Following a likely User Experience flow and revealing the Auth0 API functionality below:

1. **User loads AAWeb app and clicks login**. App should initially check session/local storage on-load to see if user is already logged-in. For Single-sign on, can use [Auth0.checkSession](https://auth0.github.io/auth0.js/global.html#checkSession). Otherwise, a first action could be for user to click on the login button to initiate the authentication flow.
2. **AAWeb app sends authorize call to Auth0 and display universal login screen** The login screen is hosted by Auth0. A user can choose to login or signup using email/password or Oauth2 login through strategy provider like Github. After user submits and Auth0 authenticates user, it returns a callback address to the web app.
3. **AAWeb receives callback address and replies to that callback address.**
4. **Auth0 now sends back a JSON Web Token (JWT) back to AAWeb** AAWeb parses JWT and extracts id_token for user information. Saves access_token, id_token and token expiration for future authentication checks. AAWeb can make an `authenticate` mutation query to the API to create an initial account store in the database.
5. **After login, AAWeb checks for user's team information by making request to GraphQL API.** Sends a POST request with an `Authorization: Bearing <auth0_access_token>`header, AAWeb queries API for `teamByOwner` using Auth0 user_info *idTokenPayload.sub* as the owner_id.
6. **GraphQL API receives query request** API parses authentication token and verifies user, compares user_id to existing user or creates a new one. Searches for any teams owned by user. Returns data in JSON format.
7. **User does not have a team and clicks on `Create Team` button**
8. User is redirected to team module client. Session is checked and if user previously logged-in, then user is automatically signed in, otherwise user has to sign-in again. *Note 1: Single-sign-on (SSO) is just a convenience function that shows a single button in login form as opposed to some "auto-login" function.* *Note 2: If user signs in with different method (ie email/pass instead of social[github]) is treated as a new user.*
9. **Auth0 sends new access_token, id_token, expiration, etc** Web app should store values for future api calls.
10. **Make authenticated API class - same as step 5** Once logged in, user can create teams, edit profile, invite others to their team, etc.
11. **Data or errors returned** Both data and errors are returned in JSON format. Data usually returned with HTTP status 204 and errors returned with status 400.

## Integration

There are three main areas to consider for integrating Auth0 into your client and server.

1. **The client** — The main entry point for the user to authenticate with Auth0. This entails using the Auth0 Lock API/library that provides the login/signup screens and other supporting auth functionalities. The main mechanism for authenticating a user is enable by, upon successful login, the provisioning of an access_token — a javascript web token (JWT).
2. **Authenticating between API and Client** - While, the client may be authenticated, we still have to reconfirm that the user is who they are. This requires us to send the logged-in users access_token to the API to be reconfirm. Also, The client needs to reconfirm their authentication if the API server returns an error such as 'Not logged in' or 'JWT expired.'
3. **The API** – On the server, once we have the access token, we need to reconfirm with Auth0 that the client is who they say they are and then capture their auth0id.

### Client
Using the Auth0 Lock package which has less "features" but allows for a more seamless experience by

```
npm i auth0-lock --save
```

On the client, I have all my auth0 logic in an [auth folder](../packages/aateam-client/src/auth)

1. First, pull in your auth config info from your .env.
```
export const AUTH_CONFIG = {
  api_audience: process.env.AUTH0_AUDIENCE,
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENTID,
  callbackUrl: process.env.AUTH0_CALLBACK_URL,
  logoutUrl: process.env.AUTH0_LOGOUT_URL
}
```
2. Then setup the main Auth0 Lock object:
```
const lock = new Auth0Lock(AUTH_CONFIG.clientId, AUTH_CONFIG.domain, {
  oidcConformant: true,
  autoclose: true,
  auth: {
    sso: true,
    redirectUrl: window.location.origin + '/callback',
    responseType: 'token id_token',
    audience: `${AUTH_CONFIG.api_audience}`,
    params: {
      scope: `openid profile email user_metadata app_metadata picture`
    }
  }
})
```

3. Finally, we need an Auth class that initializes the authentication process and binds it to our API.
```
class Auth {
  constructor (cb, apolloClient) {
    this.handleAuthentication()
    // binds functions to keep this context
    this.apolloClient = apolloClient
    this.cb = cb.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.checkSession = this.checkSession.bind(this)
  }

  login () {
    // Call the show method to display the widget.
    lock.show()
  }

  handleAuthentication () {
    // Add a callback for Lock's `authenticated` event
    lock.on('authenticated', this.setSession.bind(this))
    // Add a callback for Lock's `authorization_error` event
    lock.on('authorization_error', err => {
      console.log(err)
      const data = { status: `error`, errMessage: err.error }
      this.cb(data)
    })
  }

  checkSession () {
    // check for valid session
  }

  setSession (authResult) {
    // If authenticated, set session otherwise signin or create account
  }

  async signinOrCreateAccount ({ accessToken, idToken, expiresAt }) {
    // if session expired, sign in, and if needed, also create account
  }

  logout () {
    // Clear access token and ID token from local storage
    ...
  }

  async isAuthenticated () {
    // check session and run Auth0 SS0
    ...
  }
}
```

Once we have the auth0 library installed, configured and integrated, we need to send the auth0 access_token with our API calls and handle any auth related responses.

For this we attach middlewares to our Apollo GraphQL client.

1. **AuthRetryLink - Apollo Error Link:**
```
const authRetryLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  //check for GraphQL errors
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
})
```

2. ***AuthLink - Apollo Link:**
```
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = window.localStorage.getItem('access_token')
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ``
    }
  }
})
```

Finally, we bind to Apollo client:
3.
```
let apolloClient

const cache = new InMemoryCache().restore(window.__APOLLO_STATE__)

export const client = new ApolloClient({
  link: ApolloLink.from([authRetryLink, authLink, link]), 
  cache,
  connectToDevTools: true
})

```
