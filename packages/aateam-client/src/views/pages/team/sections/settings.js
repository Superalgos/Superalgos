/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { validObject } from '../../../../utils/js-helpers'

export const Settings = () => (state, actions) => {
  const team = validObject(state.team.profile, 'edges') ? state.team.profile.edges : ''

  return (
    <section
      class='section has-text-centered p-l-5 p-r-5'
      key='TeamSettingsContainer'
    >
      <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
        Team Settings
      </h1>
      <div class='card'>
        <div class='card-content has-text-centered'>
          <h3 class='is-size-4'>Delete Team</h3>
          <p class='is-italic'>
            {' '}
            Warning: Deleting team removes all team information and is
            irreversible
          </p>
        </div>
        <footer class='card-footer'>
          <p
            class={`is-size-5 card-footer-item
              ${
    state.team.form.form === 'deleteTeamSuccess'
      ? 'has-text-success'
      : ''
    }
              ${
    state.team.form.form === 'deleteTeamNotice'
      ? 'has-text-primary'
      : ''
    }
              ${
    state.team.form.form === 'deleteTeamError'
      ? 'has-text-danger'
      : ''
    }
              ${
    state.team.form.form === 'deleteTeamSuccess' ||
                state.team.form.form === 'deleteTeamNotice' ||
                state.team.form.form === 'deleteTeamError'
      ? ''
      : 'is-invisible'
    }`}
          >
            {state.team.form.message}
          </p>
          <p class='card-footer-item buttons is-right'>
            <button
              onclick={e => actions.team.deleteTeam({id: team[0].node.id, owner: state.user.id})}
              class='button is-red'
              disabled={state.team === ''}
            >
              Delete Team
            </button>
          </p>
        </footer>
      </div>
    </section>
  )
}

export default Settings
