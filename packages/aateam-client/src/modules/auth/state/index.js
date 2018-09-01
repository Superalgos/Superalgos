export const auth = {
  form: {
    type: 'login',
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
    unique: true
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
    strength: '',
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
    placeholder: 'Enter your email address or username',
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
}

export default auth
