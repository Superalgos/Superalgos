import { action } from '@hyperapp/fx'

import { GetAllTeamsQuery } from '../graphql/GetAllTeamsQuery'
import { GetAllAlgobotsQuery } from '../graphql/GetAllAlgobotsQuery'

import { client } from '../../../index'

export const community = {
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
  toggleModal: form => (state, actions) => {
    return {
      modal: {
        content: form,
        isActive: !state.modal.isActive
      }
    }
  },
  teams: teams => ({ teams }),
  algobots: algobots => ({ algobots }),
  getTeams: id => [
    action('form', {
      form: 'getTeamsLoad',
      message: 'Getting community teams...'
    }),
    action('getAllTeams')
  ],
  getAllTeams: () => async (state, actions) => {
    const result = await client.query({
      query: GetAllTeamsQuery,
      variables: { limit: 10, after: 0 },
      fetchPolicy: 'network-only'
    })
    console.log(result.data.teams)
    if (result.data.teams.edges.length > 0) {
      return actions.getAllTeamsSuccess(result.data.teams)
    } else {
      return actions.noTeams()
    }
  },
  getAllTeamsSuccess: teams => [
    action('form', { form: 'getAllTeamsSuccess', message: 'Community Teams' }),
    action('teams', teams)
  ],
  noTeams: profile => [
    action('form', { form: 'getAlgobotsNotice', message: 'No teams found' }),
    action('teams', [])
  ],
  getAlgobots: id => [
    action('form', {
      form: 'getAlgobotsLoad',
      message: 'Getting community algobots...'
    }),
    action('getAllAlgobots', id)
  ],
  getAllAlgobots: () => async (state, actions) => {
    const result = await client.query({
      query: GetAllAlgobotsQuery,
      variables: { limit: 10, after: 0 },
      fetchPolicy: 'network-only'
    })
    console.log(result.data.getAlgobots)
    if (result.data.getAlgobots !== null) {
      return actions.getAllAlgobotsSuccess(result.data.getAlgobots)
    } else {
      return actions.noAlgobots()
    }
  },
  getAllAlgobotsSuccess: algobots => [
    action('form', {
      form: 'getAlgobotSuccess',
      message: 'Community Algobots'
    }),
    action('algobots', algobots)
  ],
  noAlgobots: profile => [
    action('form', { form: 'getAlgobotsNotice', message: 'No algobots found' }),
    action('algobots', [])
  ]
}

export default community
