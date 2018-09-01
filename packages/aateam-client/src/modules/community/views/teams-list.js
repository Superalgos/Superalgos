/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import { TeamsItem } from './teams-item'

import { validObject } from '../../../utils/js-helpers'

export const TeamsList = props => (state, actions) => {
  const teams = validObject(state.community.teams, 'edges') ? state.community.teams.edges : ''
  console.log(state.community.form.form, state.community.form.message)

  if (
    state.community.teams.length > 0 ||
    state.community.form.form === 'getAllTeamsSuccess'
  ) {
    return (
      <div class='section' key='teamsList3'>
        <p
          class={`is-size-5 card-footer-item
            ${
      state.community.form.form === 'getAllTeamsNotice'
        ? 'has-text-primary'
        : ''
      }
            ${
      state.community.form.form === 'getAllTeamsError'
        ? 'has-text-danger'
        : ''
      }
            ${
      state.community.form.form === 'getAllTeamsNotice' ||
              state.community.form.form === 'getAllTeamsError'
        ? ''
        : 'is-invisible'
      }`}
        >
          {state.community.form.message}
        </p>
        <table class='table is-fullwidth is-striped'>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Team Name</th>
              <th>Team Owner</th>
              <th># of Members</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => (
              <TeamsItem team={team.node} key={`team-item-${team.node.id}`} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div class='section' key='teamsList4'>
      <p class='is-size-4'>{state.community.form.message}</p>
      <div class='level m-t-2'>
        <div class='level-item'>
          <span class='icon has-text-primary is-large'>
            <i class='fas fa-spinner fa-pulse' />
          </span>
        </div>
      </div>
    </div>
  )
}

export default TeamsList
