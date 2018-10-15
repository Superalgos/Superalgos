import Auth0Lock from 'auth0-lock'
import gql from 'graphql-tag'

import { getItem, setItem } from '../utils/local-storage'
import { validObject, deleteCookie } from '../utils/js-helpers'
import Log from '../utils/log'

import { client } from '../graphql/apollo'

import { AUTH_CONFIG } from './Auth0' // create by renaming Auth0.sample.js to Auth0.js and setting vars

const AUTHENTICATE = gql`
  mutation authenticate($idToken: String!) {
    teams_Authenticate(idToken: $idToken) {
      alias
      authId
    }
  }
`

const VERIFY_TEAM_INVITE = gql`
  mutation verifyTeamInvite($token: String!) {
    verifyTeamInvite(token: $token) {
      email
      team {
        slug
      }
    }
  }
`

export const defaultOptions = {
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
}

export const inviteOptions = {
  oidcConformant: true,
  autoclose: false,
  allowedConnections: ['Username-Password-Authentication'],
  allowShowPassword: true,
  auth: {
    sso: false,
    redirectUrl: window.location.origin + '/callback',
    responseType: 'token id_token',
    audience: `${AUTH_CONFIG.api_audience}`,
    params: {
      state: '',
      scope: `email`
    }
  },
  prefill: { email: '' }
}

let lock = new Auth0Lock(
  AUTH_CONFIG.clientId,
  AUTH_CONFIG.domain,
  defaultOptions
)

class Auth {
  constructor (cb, apolloClient) {
    this.handleAuthentication()
    // binds  functions to keep this context
    this.apolloClient = apolloClient
    this.cb = cb.bind(this)
    this.login = this.login.bind(this)
    this.loginInvite = this.loginInvite.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.checkSession = this.checkSession.bind(this)
  }

  login () {
    // Call the show method to display the widget.
    Log.info('logging in')
    lock.show()
  }

  async loginInvite (jwt) {
    let email
    let team
    try {
      const data = await client.mutate({
        mutation: VERIFY_TEAM_INVITE,
        variables: { token: jwt }
      })

      Log.info('auth.loginInvite')
      Log.info(await data.data.verifyTeamInvite)

      setItem('invite', JSON.stringify(data.data.verifyTeamInvite))

      email = data.data.verifyTeamInvite.email
      team = data.data.verifyTeamInvite.team.slug
    } catch (err) {
      return Log.error(err, 'loginInvite err: ')
    }
    inviteOptions.prefill.email = email
    inviteOptions.auth.params.state = `${email}|${team}`
    let lockInvite = new Auth0Lock(
      AUTH_CONFIG.clientId,
      AUTH_CONFIG.domain,
      inviteOptions
    )
    lockInvite.show()
  }

  handleAuthentication () {
    // Add a callback for Lock's `authenticated` event
    lock.on('authenticated', this.setSession.bind(this))
    // Add a callback for Lock's `authorization_error` event
    lock.on('authorization_error', err => {
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
      Log.info('setSession idTokenPayload:')
      Log.info(authResult.idTokenPayload)

      this.signinOrCreateAccount({ ...data })
      this.cb(data)
      const user = {
        authId: authResult.idTokenPayload.sub,
        alias: authResult.idTokenPayload.nickname
      }
      setItem('user', JSON.stringify(user))
      if (window.location.href.includes(`callback`)) {
        // window.location.href = '/dashboard'
      }
      return true
    }
  }

  async signinOrCreateAccount ({ accessToken, idToken, expiresAt }) {
    try {
      const response = await client.mutate({
        mutation: AUTHENTICATE,
        variables: { idToken }
      })
      Log.info('auth.signinOrCreateAccount data:')
      Log.info(response)
      const user = {
        authId: response.data.teams_Authenticate.authId,
        alias: response.data.teams_Authenticate.alias
      }
      setItem('user', JSON.stringify(user))
      if (window.location.href.includes(`callback`)) {
        window.location.href = '/'
      }
      return response.data
    } catch (err) {
      return console.log('Sign in or create account error: ', err)
    }
  }

  logout () {
    // Clear access token and ID token from local storage
    window.localStorage.clear()
    deleteCookie('ajs_anonymous_id')
    deleteCookie('ajs_user_id')
    deleteCookie('current_tenant')

    lock.logout({ returnTo: AUTH_CONFIG.logoutUrl })
  }

  async isAuthenticated () {
    // check session and run Auth0 SS0
    const getUser = await getItem('authUser')
    const getExpires = await getItem('expires_at')
    let user = JSON.parse(getUser)

    if (new Date().getTime() < getExpires * 1000) {
      console.log(
        'handleAuth.user exp: ',
        user,
        getExpires,
        window.location.href
      )

      return user
    }

    const checkSSO = await this.checkSession()
      .then(result => {
        console.log('handleAuth.checksessions: ', result)
        const user = {
          authId: result.idTokenPayload.sub,
          alias: result.idTokenPayload.nickname
        }
        setItem('authUser', JSON.stringify(user))
        // user confirmed, log into client
        this.setSession(result)
        return result.idTokenPayload
      })
      .catch(err => {
        if (err.error === 'login_required') {
          // If graphql error, update session
          // otherwise send to login
          // return this.login()
        }
        return err
      })

    if (/manage|profile|create|dashboard/.test(window.location.href) && !user) {
      this.login()
    }

    if (validObject(checkSSO, 'error')) {
      return false
    } else {
      return checkSSO
    }
  }
}

export default Auth
