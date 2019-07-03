import Auth0Lock from 'auth0-lock'
import gql from 'graphql-tag'

import { getItem, setItem } from '../utils/local-storage'
import { validObject, deleteCookie, slugify, isEmpty } from '../utils/js-helpers'
import Log from '../utils/log'

import { client } from '../graphql/apollo'

import { AUTH_CONFIG } from './Auth0' // create by renaming Auth0.sample.js to Auth0.js and setting vars

import { setInitialEcosystem } from '../utils/ecosystem'

const AUTHENTICATE = gql`
  mutation authenticate($idToken: String!) {
    users_Authenticate(idToken: $idToken) {
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
const GET_TEAMS_BY_OWNER = gql`
  query teamsByOwnerQuery {
    teams_TeamsByOwner {
      id
      name
      slug
    }
  }
`

const CREATE_TEAM = gql`
  mutation CreateTeamMutation($name: String!, $slug: String!, $botName: String!, $botSlug: String!) {
    teams_CreateTeam(name: $name, slug: $slug, botName: $botName, botSlug: $botSlug) {
      id
      name
      slug
    }
  }
`

export const defaultOptions = {
  oidcConformant: true,
  autoclose: true,
  allowedConnections: ['Username-Password-Authentication', 'github'],
  auth: {
    sso: true,
    redirectUrl: window.location.origin + '/callback',
    responseType: 'token id_token',
    audience: `${AUTH_CONFIG.api_audience}`,
    params: {
      scope: `openid profile email user_metadata app_metadata picture`
    }
  },
  theme: {
    logo: 'https://aadevelop.blob.core.windows.net/module-master/assets/logos/Superalgos-mark-auth0-lock.png',
    primaryColor: '#e3493c'
  },
  languageDictionary: {
    title: 'Superalgos Platform'
  },
  avatar: null,
  mustAcceptTerms: true
}

export const inviteOptions = {
  oidcConformant: true,
  autoclose: false,
  allowedConnections: ['Username-Password-Authentication', 'github'],
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
  prefill: { email: '' },
  languageDictionary: {
    title: 'Superalgos Platform'
  },
  avatar: null,
  mustAcceptTerms: true
}

let lock = new Auth0Lock(
  AUTH_CONFIG.clientId,
  AUTH_CONFIG.domain,
  defaultOptions
)

class Auth {
  constructor(cb, apolloClient) {
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

  login() {
    // Call the show method to display the widget.
    Log.info('logging in')
    lock.show()
  }

  async loginInvite(jwt) {
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

  handleAuthentication() {
    // Add a callback for Lock's `authenticated` event
    lock.on('authenticated', this.setSession.bind(this))
    // Add a callback for Lock's `authorization_error` event
    lock.on('authorization_error', err => {
      const data = { status: `error`, errMessage: err.error }
      this.cb(data)
    })
  }

  checkSession() {
    return new Promise((resolve, reject) => {
      // Add a callback for Lock's `authenticated` event
      lock.checkSession(
        {
          responseType: 'token id_token',
          audience: AUTH_CONFIG.api_audience,
          scope: 'openid email profile',
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

  async setSession(authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      // Set the time that the access token will expire at
      let expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      )
      const data = {
        status: `success`,
        accessToken: authResult.accessToken,
        idToken: authResult.idToken,
        expiresAt
      }
      Log.info('setSession idTokenPayload:')
      Log.info(authResult.idTokenPayload)

      try {
        setItem('access_token', authResult.accessToken)
        setItem('id_token', authResult.idToken)
        setItem('expires_at', expiresAt)
        await this.signinOrCreateAccount({ ...data })
        this.cb(data)
        const user = {
          authId: authResult.idTokenPayload.sub,
          alias: authResult.idTokenPayload.nickname
        }

        setItem('user', JSON.stringify(user))
        window.location.href = '/'
        return true
      } catch (err) {
        window.localStorage.removeItem('access_token')
        window.localStorage.removeItem('id_token')
        window.localStorage.removeItem('expires_at')
        console.log('Sign in or create account error: ', err)
      }
    }
  }

  async signinOrCreateAccount({ accessToken, idToken, expiresAt }) {
    const response = await client.mutate({
      mutation: AUTHENTICATE,
      variables: { idToken }
    })
    Log.info('auth.signinOrCreateAccount data:')
    Log.info(response)
    const user = {
      authId: response.data.users_Authenticate.authId,
      alias: response.data.users_Authenticate.alias
    }
    if (validObject(user, 'alias')) {
      Log.info(user.alias)
      const existingTeam = await client.query({
        query: GET_TEAMS_BY_OWNER
      })
      Log.info(existingTeam)
      Log.info(existingTeam.data.teams_TeamsByOwner)
      if (validObject(existingTeam.data, 'teams_TeamsByOwner') && isEmpty(existingTeam.data.teams_TeamsByOwner)) {
        const slug = slugify(user.alias)
        const newTeam = await client.mutate({
          mutation: CREATE_TEAM,
          variables: {
            name: slug,
            slug: slug,
            botName: `bot-${slug}`,
            botSlug: `bot-${slug}`
          }
        })
        Log.info(newTeam)
        Log.info(newTeam.data.teams_CreateTeam)
        if (!validObject(newTeam.data, 'teams_CreateTeam') || isEmpty(newTeam.data.teams_CreateTeam)) {
          throw newTeam.data.error
        }
        Log.info('Team and Bot Creation Success')
      }
    }
  }

  logout() {
    // Clear access token and ID token from local storage
    window.localStorage.removeItem('access_token')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('name')
    window.localStorage.removeItem('ecosystem')
    deleteCookie('ajs_anonymous_id')
    deleteCookie('ajs_user_id')
    deleteCookie('current_tenant')

    lock.logout({ returnTo: AUTH_CONFIG.logoutUrl })
  }

  async isAuthenticated() {
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

    // TODO improve to check the session validation on client side
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
