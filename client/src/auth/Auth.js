import Auth0Lock from 'auth0-lock'
import gql from 'graphql-tag'

import { getItem, setItem, removeItem } from '../utils/local-storage'
import { validObject, deleteCookie } from '../utils/js-helpers'

import { client } from '../App'

import { AUTH_CONFIG } from './Auth0' // create by renaming Auth0.sample.js to Auth0.js and setting vars

const AUTHENTICATE = gql`
  mutation authenticate($idToken: String!) {
    authenticate(idToken: $idToken) {
      alias
      authId
    }
  }
`
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

class Auth {
  constructor (cb, apolloClient) {
    this.handleAuthentication()
    // binds  functions to keep this context
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
    return new Promise((resolve, reject) => {
      // Add a callback for Lock's `authenticated` event
      lock.checkSession(
        {
          responseType: 'token id_token',
          audience: AUTH_CONFIG.api_audience,
          scope:
            'openid email profile read:teams write:teams read:member write:member',
          connection: 'github',
          prompt: 'none'
        },
        function (err, authResult) {
          if (!err) {
            resolve(authResult)
          } else {
            reject(err)
          }
        }
      )
    })
  }

  setSession (authResult) {
    console.log('setSession')
    if (authResult && authResult.accessToken && authResult.idToken) {
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      )
      setItem('access_token', authResult.accessToken)
      setItem('id_token', authResult.idToken)
      setItem('expires_at', expiresAt)
      const data = {
        status: `success`,
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        expiresAt
      }
      console.log('setSession idTokenPayload: ', authResult.idTokenPayload)

      this.signinOrCreateAccount({ ...data })
      this.cb(data)
      console.log(authResult.idTokenPayload)
      setItem('auth.user', JSON.stringify(authResult.idTokenPayload))
      if (window.location.href.includes(`callback`)) {
        window.location.href = '/'
      }
      return true
    }
  }

  async signinOrCreateAccount ({ accessToken, idToken, expiresAt }) {
    console.log(
      'signinOrCreateAccount: ',
      client,
      this.apolloClient,
      accessToken,
      idToken,
      expiresAt
    )
    try {
      const data = await client.mutate({
        mutation: AUTHENTICATE,
        variables: { idToken }
      })

      console.log('signinOrCreateAccount auth: ', await data)
      setItem('auth.user', JSON.stringify(data.data.authenticate))
      if (window.location.href.includes(`callback`)) {
        window.location.href = '/'
      } else {
        window.location.reload()
      }
      return data
    } catch (err) {
      return console.log('Sign in or create account error: ', err)
    }
  }

  logout () {
    // Clear access token and ID token from local storage
    removeItem('access_token')
    removeItem('id_token')
    removeItem('expires_at')
    removeItem('auth.user')
    removeItem('auth0.ssodata')
    window.localStorage.clear()
    deleteCookie('ajs_anonymous_id')
    deleteCookie('ajs_user_id')
    deleteCookie('current_tenant')

    lock.logout({ returnTo: AUTH_CONFIG.logoutUrl })
    console.log('logout')
  }

  async isAuthenticated () {
    // check session and run Auth0 SS0
    const getUser = await getItem('auth.user')
    let user = JSON.parse(getUser)

    if (validObject(user, 'exp') && new Date().getTime() < (user.exp * 1000)) {
      console.log('handleAuth.user exp: ', user, window.location.href)

      return user
    }

    const checkSSO = await this.checkSession()
      .then(result => {
        console.log('handleAuth.checksessions: ', result)
        setItem('auth.user', result.idTokenPayload.sub)
        // user confirmed, log into client
        this.setSession(result)
        return result.idTokenPayload
      })
      .catch(err => {
        console.log('handleAuth.checksessions err: ', err)
        if (err.error === 'login_required') {
          // return this.login()
        }
        return err
      })
    if (
      (window.location.href.includes(`manage`) ||
        window.location.href.includes(`profile`)) &&
      !user
    ) {
      window.location.href = '/'
    }

    if (/manage|profile|create|dashboard/.test(window.location.href) && !user) {
      this.login()
    }

    console.log('handleAuth.isAuthenticated 2: ', checkSSO, user)
    if (validObject(checkSSO, 'error')) {
      return false
    } else {
      return checkSSO
    }
  }
}

export default Auth
