/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { validObject } from '../../../utils/js-helpers'

export const TeamPanel = props => (state, actions) => {
  const team = validObject(state.team.profile, 'edges') ? state.team.profile.edges : ''
  if (team === '') {
    return (
      <div class='section' key='teamList' class='is-marginless is-paddingless'>
        <h2 class='title is-size-4 m-t-1'>Team</h2>
        <p class='is-size-4'>You don't have a team yet!</p>
        <div class='level m-t-2'>
          <div class='level-item'>
            <a
              class='button is-primary is-medium'
              onclick={() => actions.toggleModal('AddTeam')}
            >
              Create a team
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (team[0].node.name !== '' && team[0].node.name !== null) {
    const initial = team[0].node.name.substring(0, 1)
    return (
      <div class='section' key='teamList' class='is-marginless is-paddingless'>
        <h2 class='title is-size-4 m-t-1'>Team</h2>
        {team[0].node.profile !== null && team[0].node.profile.avatar !== '' ? (
          <div class='image is-32x32 avatar'>
            <img src={team[0].node.avatar} alt={team[0].node.name} />
          </div>
        ) : (
          <div class='image is-32x32 avatar has-text-white is-uppercase is-red is-size-3 is-centered'>
            {initial}
          </div>
        )}
        <p class='title'>{team[0].node.name}</p>
        <p class='is-size-4'>Team leader: {team[0].node.owner.nickname}</p>
      </div>
    )
  }

  return (
    <div class='section' key='teamList' class='is-marginless is-paddingless'>
      <h2 class='title is-size-4 m-t-1'>Team</h2>
      <p class='is-size-4'>{state.team.form.message}</p>
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

export default TeamPanel
