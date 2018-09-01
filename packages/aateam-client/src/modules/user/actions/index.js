import { action } from '@hyperapp/fx'

import { client } from '../../../index'
import { LoginMutation } from '../graphql/Login'

// import { auth } from '../../auth/actions'

import { removeItem } from '../../../utils/local-storage'

export const user = {
  form: ({ form, message }) => state => {
    return {
      form: {
        form,
        message
      }
    }
  },
  clearForms: () => ({
    form: {
      form: 'login',
      message: ''
    }
  }),
  login: value => [
    action('form', { form: 'loginNotice', message: 'Logging you in...' }),
    action('loginSubmit', value)
  ],
  loginSubmit: loginForm => async (state, actions) => {
    loginForm.preventDefault()
    loginForm.target.blur()

    const usernameOrEmail = loginForm.target.form[0].value
    const password = loginForm.target.form[1].value
    const result = await client.mutate({
      mutation: LoginMutation,
      variables: { input: { usernameOrEmail, password } }
    })
    console.log('actions.user.loginSubmit: ', result.data.login)
    if (result.data.login.user !== null) {
      return actions.setLoggedIn(result.data.login.user)
    } else {
      return actions.form({
        form: 'loginError',
        message: result.data.login.errors[0].message
      })
    }
  },
  loginRegister: user => async (state, actions) => {
    const usernameOrEmail = user.username
    const password = user.password
    const result = await client.mutate({
      mutation: LoginMutation,
      variables: { input: { usernameOrEmail, password } }
    })
    console.log('actions.user.loginRegister: ', result.data.login)
    if (result.data.login.user !== null) {
      return actions.setLoggedIn(result.data.login.user)
    } else {
      return actions.form({
        form: 'loginError',
        message: result.data.login.errors[0].message
      })
    }
  },
  setLoggedIn: user => state => ({
    auth: {
      loggedIn: true,
      role: user.role
    },
    profile: {
      id: user.id,
      ghId: '',
      username: user.username,
      email: user.email,
      name: '',
      avatar: '',
      url: ''
    }
  }),
  logOut: () => async (state, actions) => {
    await removeItem('accessToken')
    await removeItem('refreshToken')
    return actions.loggedOut()
  },
  loggedOut: () => state => ({
    auth: {
      loggedIn: false,
      role: ''
    },
    profile: {}
  })
}

export default user
