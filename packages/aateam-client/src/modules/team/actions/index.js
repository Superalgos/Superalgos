import { action, throttle } from '@hyperapp/fx'

import { UniqueTeamnameQuery } from '../graphql/UniqueTeamnameQuery'
import { AddTeamMutation } from '../graphql/AddTeamMutation'
import { GetTeamQuery } from '../graphql/GetTeamQuery'
import { DeleteTeamMutation } from '../graphql/DeleteTeamMutation'

import { client } from '../../../index'

import { mergeDeep, validObject } from '../../../utils/js-helpers'

export const team = {
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
    createTeam: {
      input: '',
      unique: false,
      placeholder: 'Your teamname'
    }
  }),
  checkTeamname: value => [
    action('throttleTeamname', value),
    action('createTeam.input', value)
  ],
  throttleTeamname: value => throttle(750, 'uniqueTeamname', value),
  uniqueTeamname: value => async (state, actions) => {
    const result = await client.query({
      query: UniqueTeamnameQuery,
      variables: { name: value }
    })
      .catch((res) => {
        const errors = res.graphQLErrors.map((error) => {
          return error.message
        })
        return actions.form({ form: 'uniqueTeamnameError', message: errors })
      })
    return actions.createTeam.unique(result.data.teamByName === null)
  },
  createTeam: {
    input: value => state => {
      const teamnameInput = {
        input: value
      }
      return mergeDeep(teamnameInput, state.createTeam)
    },
    unique: value => state => {
      const teamnameInput = {
        unique: value
      }
      return mergeDeep(teamnameInput, state.createTeam)
    },
    error: message => state => {
      const errorInput = {
        message: message
      }
      return mergeDeep(errorInput, state.createTeam)
    }
  },
  profile: profile => (state, actions) => {
    return {
      profile
    }
  },
  addTeam: result => [
    action('form', { form: 'addTeamNotice', message: `Adding your team...` }),
    action('addTeamSubmit', result)
  ],
  addTeamSubmit: teamForm => async (state, actions) => {
    teamForm.preventDefault()
    teamForm.target.blur()

    const teamname = teamForm.target.form[0].value

    const slug = await teamname.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
    const validateSlug = new RegExp('^[a-z0-9-]+$')
    const valid = await validateSlug.test(slug)
    await console.log('actions.team.addTeam: ', valid, slug)
    if (!valid) {
      return actions.form({
        form: 'addTeamError',
        message: 'Team name not valid. Please only letters, numbers and spaces'
      })
    }

    const team = {
      name: teamname,
      slug: slug,
      owner: teamForm.target.form[1].value
    }

    const uniqueTeam = await client.query({
      query: UniqueTeamnameQuery,
      variables: { name: teamname }
    })
    await console.log(
      'actions.team.addTeam: ',
      team,
      valid,
      uniqueTeam,
      uniqueTeam.data.uniqueTeamname
    )
    if (uniqueTeam.data.teamByName !== null) {
      return actions.form({
        form: 'addTeamError',
        message: 'Sorry, this team name is taken. Please create a new one'
      })
    }

    const result = await client.mutate({
      mutation: AddTeamMutation,
      variables: { name: teamname, slug: slug, owner: teamForm.target.form[1].value },
      options: {
        update: (proxy, { data: { getTeamByOwner } }) => {
          const data = proxy.readQuery({ GetTeamQuery })
          data.getTeamByOwner.push(getTeamByOwner)
          proxy.writeQuery({ GetTeamQuery, data })
        }
      }
    })

    if (result.data.addTeam !== null) {
      return actions.addTeamSuccess(result.data.addTeam)
    } else {
      return actions.form({
        form: 'addTeamError',
        message: `Unable to add Team: ${result.data.addTeam.errors[0].message}`
      })
    }
  },
  addTeamSuccess: result => [
    action('form', { form: 'addTeamSuccess', message: 'Team Added!' }),
    action('profile', result),
    action('createTeam.input', '')
  ],
  toggleModal: form => (state, actions) => {
    return {
      modal: {
        content: form,
        isActive: !state.modal.isActive
      }
    }
  },
  getTeam: id => [
    action('form', { form: 'getTeamLoad', message: 'Getting your team...' }),
    action('getTeambyOwner', id)
  ],
  getTeambyOwner: id => async (state, actions) => {
    const result = await client.query({
      query: GetTeamQuery,
      variables: { auth0id: id },
      fetchPolicy: 'network-only'
    })

    if (result.data.teamByOwner.edges.length > 0) {
      return actions.getTeamSuccess(result.data.teamByOwner)
    } else {
      return actions.getTeamNoTeam()
    }
  },
  getTeamSuccess: profile => [
    action('form', { form: 'getTeamSuccess', message: 'Your team' }),
    action('profile', profile)
  ],
  getTeamNoTeam: profile => [
    action('form', { form: 'getTeamNotice', message: 'No team found' }),
    action('profile', { name: '' })
  ],
  deleteTeam: id => [
    action('form', {
      form: 'deleteTeamLoad',
      message: 'Removing your team...'
    }),
    action('deleteTeamSubmit', id)
  ],
  deleteTeamSubmit: ({ id }) => async (state, actions) => {
    console.log('deleteTeamSubmit: ', id)
    const result = await client.mutate({
      mutation: DeleteTeamMutation,
      variables: { id: id },
      options: {
        update: (proxy, { data: { getTeamByOwner } }) => {
          const data = proxy.readQuery({ GetTeamQuery })
          data.getTeamByOwner.push(getTeamByOwner)
          proxy.writeQuery({ GetTeamQuery, data })
        }
      }
    })
      .catch((res) => {
        const errors = res.graphQLErrors.map((error) => {
          return error.message
        })
        return actions.form({ form: 'deleteTeamError', message: errors })
      })

    if (validObject(result, 'data') && result.data.deleteTeam !== null) {
      return actions.deleteTeamSuccess({ name: '' })
    } else {
      return actions.form({ form: 'deleteTeamError', message: result })
    }
  },
  deleteTeamSuccess: profile => [
    action('form', {
      form: 'deleteTeamSuccess',
      message: 'Your team has been deleted'
    }),
    action('profile', profile)
  ]
}

export default team
