/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'
import { validObject } from '../../../utils/js-helpers'

export const AlgobotPanel = props => (state, actions) => {
  const algobot = validObject(state.algobot.profile, 'edges') ? state.team.profile.edges : ''

  if (algobot === '') {
    return (
      <div
        class='section'
        key='algobotList1'
        class='is-marginless is-paddingless'
      >
        <h2 class='title is-size-4 m-t-1'>Algobots</h2>
        <p class='is-size-5'>
          Create a team first,<br />then setup your algobot!
        </p>
      </div>
    )
  }

  if (
    state.algobot.form.form === 'getAlgobotNotice' &&
    state.algobot.form.message === 'No algobot found' &&
    algobot.name === ''
  ) {
    return (
      <div
        class='section'
        key='algobotList2'
        class='is-marginless is-paddingless p-l-1 p-r-1'
      >
        <h2 class='title is-size-4 m-t-1'>Algobots</h2>
        <p class='is-size-5'>Algobot creation currently disabled</p>
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
      <div
        class='section'
        key='algobotList3'
        class='is-marginless is-paddingless'
      >
        <h2 class='title is-size-4 m-t-1'>Algobots</h2>
        <table class='table is-fullwidth is-striped is-narrow'>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Name</th>
              <th>Team</th>
              <th>Owner</th>
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
                <td class='is-size-6'>
                  <strong>{algobot.name}</strong>
                </td>
                <td class='is-size-6'>{state.team.profile.name}</td>
                <td class='is-size-6'>{state.user.profile.username}</td>
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
    <div
      class='section'
      key='algobotList4'
      class='is-marginless is-paddingless'
    >
      <h2 class='title is-size-4 m-t-1'>Algobots</h2>
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

export default AlgobotPanel
