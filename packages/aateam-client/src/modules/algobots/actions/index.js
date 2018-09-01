import { action, throttle } from '@hyperapp/fx'

import { UniqueAlgobotnameQuery } from '../graphql/UniqueAlgobotnameQuery'
import { AddAlgobotMutation } from '../graphql/AddAlgobotMutation'
import { GetAlgobotQuery } from '../graphql/GetAlgobotQuery'
import { DeleteAlgobotMutation } from '../graphql/DeleteAlgobotMutation'

import { client } from '../../../index'

import { mergeDeep } from '../../../utils/js-helpers'

export const algobot = {
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
    createAlgobot: {
      input: '',
      unique: false,
      placeholder: 'Your algobotname'
    }
  }),
  checkAlgobotname: value => [
    action('throttleAlgobotname', value),
    action('createAlgobot.input', value)
  ],
  throttleAlgobotname: value => throttle(750, 'uniqueAlgobotname', value),
  uniqueAlgobotname: value => async (state, actions) => {
    const result = await client.query({
      query: UniqueAlgobotnameQuery,
      variables: { algobotname: value }
    })
    return actions.createAlgobot.unique(result.data.uniqueAlgobotname)
  },
  createAlgobot: {
    input: value => state => {
      const algobotnameInput = {
        input: value
      }
      return mergeDeep(algobotnameInput, state.createAlgobot)
    },
    unique: value => state => {
      const algobotnameInput = {
        unique: value
      }
      return mergeDeep(algobotnameInput, state.createAlgobot)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.createAlgobot)
    }
  },
  profile: profile => (state, actions) => {
    return {
      profile
    }
  },
  addAlgobot: result => [
    action('form', {
      form: 'addAlgobotNotice',
      message: `Adding your algobot...`
    }),
    action('addAlgobotSubmit', result)
  ],
  addAlgobotSubmit: algobotForm => async (state, actions) => {
    algobotForm.preventDefault()
    algobotForm.target.blur()

    const algobotname = algobotForm.target.form[0].value

    const slug = await algobotname.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
    const validateSlug = new RegExp('^[a-z0-9-]+$')
    const valid = await validateSlug.test(slug)
    await console.log('actions.algobot.addAlgobot: ', valid, slug)
    if (!valid) {
      return actions.form({
        form: 'addAlgobotError',
        message:
          'Algobot name not valid. Please only letters, numbers and spaces'
      })
    }

    const teamId = algobotForm.target.form[2].value

    if (teamId === '') {
      return actions.form({
        form: 'addAlgobotError',
        message: 'Please create a team first!'
      })
    }

    const algobot = {
      name: algobotname,
      slug: slug,
      owner: algobotForm.target.form[1].value,
      team_id: teamId
    }

    const uniqueAlgobot = await client.query({
      query: UniqueAlgobotnameQuery,
      variables: { algobotname: algobotname }
    })
    await console.log(
      'actions.algobot.addAlgobot: ',
      algobot,
      valid,
      uniqueAlgobot,
      uniqueAlgobot.data.uniqueAlgobotname
    )
    if (!uniqueAlgobot.data.uniqueAlgobotname) {
      return actions.form({
        form: 'addAlgobotError',
        message: 'Sorry, this algobot name is taken. Please create a new one'
      })
    }

    const result = await client.mutate({
      mutation: AddAlgobotMutation,
      variables: { input: algobot },
      options: {
        update: (proxy, { data: { getAlgobotByOwner } }) => {
          const data = proxy.readQuery({ GetAlgobotQuery })
          data.getAlgobotByOwner.push(getAlgobotByOwner)
          proxy.writeQuery({ GetAlgobotQuery, data })
        }
      }
    })

    if (result.data.addAlgobot !== null) {
      return actions.addAlgobotSuccess(result.data.addAlgobot)
    } else {
      return actions.form({
        form: 'addAlgobotError',
        message: `Unable to add Algobot: ${
          result.data.addAlgobot.errors[0].message
        }`
      })
    }
  },
  addAlgobotSuccess: result => [
    action('form', { form: 'addAlgobotSuccess', message: 'Algobot Added!' }),
    action('profile', result),
    action('createAlgobot.input', ''),
    action('toggleModal', '')
  ],
  toggleModal: form => (state, actions) => {
    return {
      modal: {
        content: form,
        isActive: !state.modal.isActive
      }
    }
  },
  getAlgobots: id => [
    action('form', {
      form: 'getAlgobotLoad',
      message: 'Getting your algobot...'
    }),
    action('getAlgobotbyOwner', id)
  ],
  getAlgobotbyOwner: id => async (state, actions) => {
    /*
    const result = await client.query({
      query: GetAlgobotQuery,
      variables: { owner: id },
      fetchPolicy: 'network-only'
    })

    if (result.data.getAlgobotByOwner !== null) {
      return actions.getAlgobotSuccess(result.data.getAlgobotByOwner)
    } else {
      return actions.getAlgobotNoAlgobot()
    } */
    return actions.getAlgobotNoAlgobot()
  },
  getAlgobotSuccess: profile => [
    action('form', { form: 'getAlgobotSuccess', message: 'Your algobot' }),
    action('profile', profile)
  ],
  getAlgobotNoAlgobot: profile => [
    action('form', { form: 'getAlgobotNotice', message: 'No algobot found' }),
    action('profile', { name: '' })
  ],
  deleteAlgobot: id => [
    action('form', {
      form: 'deleteAlgobotLoad',
      message: 'Removing your algobot...'
    }),
    action('deleteAlgobotSubmit', id)
  ],
  deleteAlgobotSubmit: id => async (state, actions) => {
    const result = await client.mutate({
      mutation: DeleteAlgobotMutation,
      variables: { id: Number(id) },
      options: {
        update: (proxy, { data: { getAlgobotByOwner } }) => {
          const data = proxy.readQuery({ GetAlgobotQuery })
          data.getAlgobotByOwner.push(getAlgobotByOwner)
          proxy.writeQuery({ GetAlgobotQuery, data })
        }
      }
    })

    if (result.data.deleteAlgobot.id !== null) {
      return actions.deleteAlgobotSuccess({ name: '' })
    } else {
      return actions.form({
        form: 'deleteAlgobotError',
        message: 'No algobot found'
      })
    }
  },
  deleteAlgobotSuccess: profile => [
    action('form', {
      form: 'deleteAlgobotSuccess',
      message: 'Your algobot has been deleted'
    }),
    action('profile', profile)
  ]
}

export default algobot
