import { action } from '@hyperapp/fx'

import { mergeDeep } from '../../../utils/js-helpers'

export const onboard = {
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
    dashboard: {
      team: false,
      algobot: false,
      develop: false,
      compete: false,
      active: true
    }
  }),
  registerEmail: {
    input: value => state => {
      const emailInput = {
        input: value
      }
      return mergeDeep(emailInput, state.registerEmail)
    }
  },
  checkUsername: value => [
    action('throttleUsername', value),
    action('createUsername.input', value)
  ]
}

export default onboard
