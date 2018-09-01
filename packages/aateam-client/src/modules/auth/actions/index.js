import { action, throttle, delay } from '@hyperapp/fx'

import { client } from '../../../index'
import { UniqueUsernameQuery } from '../graphql/UniqueUsernameQuery'
import { RegisterSubmitMutation } from '../graphql/RegisterSubmit'
import { VerifyEmailMutation } from '../graphql/VerifyEmail'
import { FinishRegisterMutation } from '../graphql/FinishRegisterMutation'
import { ForgotPassSubmitMutation } from '../graphql/ForgotPass'
import { ResetPassSubmitMutation } from '../graphql/ResetPass'

import { mergeDeep } from '../../../utils/js-helpers'

const emailRegex = new RegExp(
  "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
)

export const auth = {
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
    },
    username: {
      input: '',
      placeholder: 'Your username or email',
      valid: false
    },
    createUsername: {
      input: '',
      placeholder: 'Create a username',
      valid: false,
      unique: false
    },
    email: {
      input: '',
      placeholder: 'Your email address',
      valid: false
    },
    registerEmail: {
      input: ''
    },
    password: {
      input: '',
      placeholder: 'Your password',
      valid: false
    },
    createPassword: {
      input: '',
      placeholder: 'Your new password',
      secure: false,
      valid: false
    },
    confirmPassword: {
      input: '',
      placeholder: 'Confirm your password',
      matches: false,
      valid: false
    },
    forgotEmail: {
      input: '',
      placeholder: 'Enter your email address',
      valid: false
    },
    resetPassword: {
      input: '',
      placeholder: 'Set a new password',
      strength: '',
      valid: false
    },
    confirmResetPassword: {
      input: '',
      placeholder: 'Confirm your new password',
      matches: false,
      valid: false
    },
    finishRegister: {
      load: false,
      error: false,
      message: '',
      success: false
    }
  }),
  username: {
    input: value => state => {
      const usernameInput = {
        input: value
      }
      return mergeDeep(usernameInput, state.username)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.username)
    }
  },
  email: {
    input: value => state => {
      const emailInput = {
        input: value,
        valid: emailRegex.test(value)
      }
      return mergeDeep(emailInput, state.email)
    },
    sent: value => state => {
      const emailInput = {
        input: value
      }
      return mergeDeep(emailInput, state.email)
    }
  },
  registerEmail: {
    input: value => state => {
      const emailInput = {
        input: value
      }
      return mergeDeep(emailInput, state.registerEmail)
    }
  },
  password: {
    input: value => state => {
      const passwordInput = {
        input: value,
        valid: value !== ''
      }
      return mergeDeep(passwordInput, state.password)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.password)
    }
  },
  checkUsername: value => [
    action('throttleUsername', value),
    action('createUsername.input', value)
  ],
  throttleUsername: value => throttle(750, 'uniqueUsername', value),
  uniqueUsername: value => async (state, actions) => {
    const result = await client.query({
      query: UniqueUsernameQuery,
      variables: { username: value }
    })

    const unique = result.data.uniqueUsername
    if (unique) {
      return actions.setUsername(unique)
    } else {
      return actions.setUsernameError(unique)
    }
  },
  setUsername: value => [
    action('createUsername.setUnique', value),
    action('createUsername.error', '')
  ],
  setUsernameError: value => [
    action('createUsername.setUnique', value),
    action('createUsername.error', 'This username already exists')
  ],
  createUsername: {
    input: value => state => {
      const usernameInput = {
        input: value
      }
      return mergeDeep(usernameInput, state.createUsername)
    },
    setUnique: value => state => {
      const usernameInput = {
        unique: value
      }
      return mergeDeep(usernameInput, state.createUsername)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.createUsername)
    }
  },
  createPassword: {
    input: value => state => {
      let passStrength = 'weak'
      const strongRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})'
      )
      const mediumRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})'
      )
      if (mediumRegex.test(value)) {
        passStrength = 'medium'
      }
      if (strongRegex.test(value)) {
        passStrength = 'strong'
      }
      const passwordInput = {
        input: value,
        strength: passStrength
      }
      return mergeDeep(passwordInput, state.createPassword)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.createPassword)
    }
  },
  confirmPassword: {
    input: ({ value, confirm }) => state => {
      const passwordInput = {
        input: value,
        matches: value === confirm
      }
      return mergeDeep(passwordInput, state.confirmPassword)
    }
  },
  register: registerForm => [
    action('form', {
      form: 'registerLoad',
      message: 'Submitting registration...'
    }),
    action('registerSubmit', registerForm)
  ],
  registerSubmit: registerForm => async (state, actions) => {
    registerForm.preventDefault()
    registerForm.target.blur()

    const email = registerForm.target.form[0].value

    if (!state.email.valid) {
      return action('form', {
        form: 'registerSignup',
        message: 'Please submit a valid email address'
      })
    }
    const result = await client.mutate({
      mutation: RegisterSubmitMutation,
      variables: { input: { email } }
    })

    if (
      result.data.registerSubmit.user !== '' &&
      result.data.registerSubmit.user !== null
    ) {
      return actions.registerSubmitSuccess(result)
    } else {
      return actions.form({
        form: 'registerError',
        message: result.data.registerSubmit.errors[0].message
      })
    }
  },
  registerSubmitSuccess: result => [
    action('form', {
      form: 'registerSuccess',
      message:
        'To continue registration, please check your email for further instructions'
    }),
    action('email.input', '')
  ],
  verifyRegister: token => [
    action('form', { form: 'loading', message: 'Verifying registration...' }),
    action('verifyEmail', token)
  ],
  verifyEmail: token => async (state, actions) => {
    const result = await client.mutate({
      mutation: VerifyEmailMutation,
      variables: { token: token }
    })

    const email = await result.data.verifyEmail.user.email
    console.log('actions.auth.verifyEmail: ', email)
    if (email !== '' && email !== null) {
      return actions.verifySuccess(email)
    } else {
      return actions.form({
        form: 'error',
        message: `Could not verify token: ${
          result.data.verifyEmail.errors[0].message
        }`
      })
    }
  },
  verifySuccess: email => [
    action('registerEmail.input', email),
    action('form', {
      form: 'verifySuccess',
      message: 'Continue registration...'
    })
  ],
  finishRegister: {
    load: value => state => {
      const newState = {
        load: value
      }
      return mergeDeep(newState, state.finishRegister)
    },
    error: value => state => {
      const newState = {
        error: value
      }
      return mergeDeep(newState, state.finishRegister)
    },
    message: value => state => {
      const newState = {
        message: value
      }
      return mergeDeep(newState, state.finishRegister)
    },
    success: value => state => {
      const newState = {
        success: value
      }
      return mergeDeep(newState, state.finishRegister)
    }
  },
  finish: registerForm => [
    action('finishRegister.load', true),
    action('finishRegister.message', 'Completing registration...'),
    action('finishSubmit', registerForm)
  ],
  finishSubmit: registerForm => async (state, actions) => {
    registerForm.preventDefault()
    registerForm.target.blur()

    const username = registerForm.target.form[0].value
    const password = registerForm.target.form[1].value
    const confirm = registerForm.target.form[2].value
    const email = registerForm.target.form[3].value
    console.log(
      'actions.auth.finishSubmit: ',
      username,
      password,
      confirm,
      email
    )

    var checkUsername = await client.query({
      query: UniqueUsernameQuery,
      variables: { username: username }
    })

    if (!checkUsername) {
      actions.finishRegister.load(false)
      actions.finishRegister.error(true)
      actions.finishRegister.message('Username already exist.')
      return false
    }

    if (password !== confirm) {
      actions.finishRegister.load(false)
      actions.finishRegister.error(true)
      actions.finishRegister.message('Passwords do not match')
      actions.confirmPassword.input({ value: confirm, confirm: password })
      return false
    }

    if (checkUsername && password === confirm) {
      const result = await client.mutate({
        mutation: FinishRegisterMutation,
        variables: { input: { username, email, password } }
      })
      if (result.data.finishRegister.user !== null) {
        actions.finishRegister.load(false)
        actions.finishRegister.error(false)
        actions.finishRegister.success(true)
        actions.finishRegister.message(
          'Registration complete. Logging you in...'
        )
        return actions.form({
          form: 'finishSuccess',
          message: 'Registration complete. Logging you in...'
        })
      } else {
        actions.finishRegister.load(false)
        actions.finishRegister.error(true)
        actions.finishRegister.message(
          `${result.data.finishRegister.errors[0].field}: ${
            result.data.finishRegister.errors[0].message
          }`
        )
        actions.confirmPassword.input({ value: confirm, confirm: password })
        return false
      }
    }

    return state
  },
  finishSubmitError: result => [
    action('form', { form: 'finishError', message: `Error: ${result}` })
  ],
  checkEmailUsername: value => [
    action('throttleUsername', value),
    action('createUsername.input', value)
  ],
  throttleEmailUsername: value => throttle(750, 'uniqueUsername', value),
  forgotEmail: {
    input: value => state => {
      const usernameInput = {
        input: value
      }
      return mergeDeep(usernameInput, state.forgotEmail)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.forgotEmail)
    },
    valid: value => state => {
      const emailInput = {
        valid: emailRegex.test(value)
      }
      return mergeDeep(emailInput, state.forgotEmail)
    }
  },
  forgotPass: forgotPassForm => [
    action('form', {
      form: 'forgotPassLoad',
      message: 'Submitting password reset...'
    }),
    action('forgotPassSubmit', forgotPassForm)
  ],
  forgotPassSubmit: forgotPassForm => async (state, actions) => {
    forgotPassForm.preventDefault()
    forgotPassForm.target.blur()

    const email = forgotPassForm.target.form[0].value
    console.log('actions.auth.forgotPassSubmit: ', email)
    if (!emailRegex.test(email)) {
      return action('form', {
        form: 'registerSignup',
        message: 'Please submit a valid email address'
      })
    }
    const result = await client.mutate({
      mutation: ForgotPassSubmitMutation,
      variables: { input: { email: email } }
    })
    console.log('actions.auth.forgotPassSubmit 2: ', result)
    if (
      result.data.forgotPassword !== '' &&
      result.data.forgotPassword !== null
    ) {
      if (result.data.forgotPassword === 'Success') {
        return actions.form({
          form: 'forgotPassSuccess',
          message: 'Please check your email for further instructions'
        })
      }
      return actions.form({
        form: 'forgotPassError',
        message: `Failed to reset password: ${result.data.forgotPassword}`
      })
    }
  },
  resetPassword: {
    input: value => state => {
      let passStrength = 'weak'
      const strongRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})'
      )
      const mediumRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})'
      )
      if (mediumRegex.test(value)) {
        passStrength = 'medium'
      }
      if (strongRegex.test(value)) {
        passStrength = 'strong'
      }
      const passwordInput = {
        input: value,
        strength: passStrength
      }
      return mergeDeep(passwordInput, state.resetPassword)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.resetPassword)
    }
  },
  confirmResetPassword: {
    input: ({ value, confirm }) => state => {
      const passwordInput = {
        input: value,
        matches: value === confirm
      }
      return mergeDeep(passwordInput, state.confirmResetPassword)
    }
  },
  resetPass: resetPassForm => [
    action('form', {
      form: 'resetPassLoad',
      message: 'Updating your password...'
    }),
    action('resetPassSubmit', resetPassForm)
  ],
  resetPassSubmit: resetPassForm => async (state, actions) => {
    resetPassForm.preventDefault()
    resetPassForm.target.blur()

    const password = resetPassForm.target.form[0].value
    const confirm = resetPassForm.target.form[1].value
    const token = resetPassForm.target.form[2].value
    console.log(
      'actions.auth.resetPassSubmit: ',
      password,
      confirm,
      token,
      resetPassForm
    )
    if (password !== confirm) {
      return action('form', {
        form: 'resetPassError',
        message: 'Passwords do not match'
      })
    }
    const result = await client.mutate({
      mutation: ResetPassSubmitMutation,
      variables: {
        input: {
          password: password,
          passwordConfirmation: confirm,
          token: token
        }
      }
    })
    console.log('actions.auth.resetPassSubmit 2: ', result)
    if (
      result.data.resetPassword !== '' &&
      result.data.resetPassword !== null
    ) {
      if (result.data.resetPassword.errors === null) {
        actions.form({
          form: 'resetPassDone',
          message: 'Redirecting to Login...'
        })
        return actions.delayResetRedirect()
      }
      return actions.form({
        form: 'resetPassError',
        message: `Failed to reset password: ${
          result.data.resetPassword.errors[0].message
        }`
      })
    }
  },
  delayResetRedirect: () => delay(3000, 'resetPassSuccess'),
  resetPassSuccess: resetPassForm => [
    action('form', {
      form: 'resetPassSuccess',
      message: 'Redirecting to Login...'
    })
  ]
}

export default auth
