/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'
import { validObject } from '../../../utils/js-helpers'

export const AlgobotList = props => (state, actions) => {
  const algobot = state.algobot.profile
  console.log(state.algobot.form.form, state.algobot.form.message, algobot.name)
  if (
    state.algobot.form.form === 'getAlgobotNotice' &&
    state.algobot.form.message === 'No algobot found' &&
    algobot.name === '' &&
    state.team.profile.name === ''
  ) {
    return (
      <div class='section' key='algobotList1'>
        <p class='is-size-4'>
          You don't have a team yet! Please create one before adding an algobot.
        </p>
        <div class='level m-t-2'>
          <div class='level-item'>
            <Link to='/team' class='button navbar-item'>
              Go to Team Overview &rarr;
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (
    state.algobot.form.form === 'getAlgobotNotice' &&
    state.algobot.form.message === 'No algobot found' &&
    algobot.name === ''
  ) {
    return (
      <div class='section' key='algobotList2'>
        <p class='is-size-4'>Algobot creation currently disabled</p>
        <div class='level m-t-2'>
          <div class='level-item'>
            <a
              class='button is-primary is-medium'
              disabled={true}
              onclick={() => actions.algobot.toggleModal('AddAlgobot')}
            >
              Create an algobot
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (
    (algobot.name !== '' && algobot.name !== null) ||
    state.algobot.form.form === 'deleteAlgobotSuccess'
  ) {
    const initial = algobot.name.substring(0, 1)
    return (
      <div class='section' key='algobotList3'>
        <p
          class={`is-size-5 card-footer-item
            ${
      state.algobot.form.form === 'deleteAlgobotSuccess'
        ? 'has-text-success'
        : ''
      }
            ${
      state.algobot.form.form === 'deleteAlgobotNotice'
        ? 'has-text-primary'
        : ''
      }
            ${
      state.algobot.form.form === 'deleteAlgobotError'
        ? 'has-text-danger'
        : ''
      }
            ${
      state.algobot.form.form === 'deleteAlgobotSuccess' ||
              state.algobot.form.form === 'deleteAlgobotNotice' ||
              state.algobot.form.form === 'deleteAlgobotError'
        ? ''
        : 'is-invisible'
      }`}
        >
          {state.algobot.form.message}
        </p>
        <table class='table is-fullwidth is-striped'>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Algobot Name</th>
              <th>Team</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Repo</th>
              <th class='has-text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {algobot.name !== '' ? (
              <tr>
                <td>
                  {algobot.avatar !== null && algobot.avatar !== '' ? (
                    <div class='image is-16x16 avatar'>
                      <img src={algobot.avatar} alt={algobot.name} />
                    </div>
                  ) : (
                    <div class='image is-16x16 avatar has-text-white is-uppercase is-green is-size-7 is-centered'>
                      {initial}
                    </div>
                  )}
                </td>
                <td>
                  <strong>{algobot.name}</strong>
                </td>
                <td>{state.team.profile.name}</td>
                <td />
                <td>{state.user.profile.username}</td>
                <td />
                <td class='has-text-right'>
                  <button
                    onclick={e =>
                      actions.algobot.deleteAlgobot(
                        state.algobot.profile.id,
                        state.algobot.profile.owner
                      )
                    }
                    class='button is-small is-red'
                    disabled={
                      state.algobot.form.form === 'getAlgobotNotice' &&
                      state.algobot.form.message === 'Removing your algobot...'
                    }
                  >
                    <span class='icon'>
                      <i class='fas fa-trash-alt' />
                    </span>
                  </button>
                </td>
              </tr>
            ) : (
              ''
            )}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div class='section' key='algobotList4'>
      <p class='is-size-4'>{state.algobot.form.message}</p>
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

export default AlgobotList
