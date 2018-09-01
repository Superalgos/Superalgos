/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Switch, Route, Redirect } from '@hyperapp/router'

import { Sidebar } from '../../nav/sidebar'
import { Overview, Members, Settings } from './sections'
import { Algobots } from '../algobots/sections'

import { AddTeamForm } from '../../../modules/team/views'

export const TeamWrapper = props => (state, actions) => {
  if (state.loggedIn) {
    const name =
      state.user.name === (undefined || null || '')
        ? 'friend'
        : state.user.name
    return (
      <div
        class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
        key='team-box'
      >
        <div class='columns is-gapless'>
          <div class='column is-2 is-navy'>
            <Sidebar />
          </div>
          <div class='column is-light'>
            <Switch>
              <Route path='/team' render={Overview} />
              <Route path='/algobots' render={Algobots} />
              <Route path='/team/members' render={Members} />
              <Route path='/team/settings' render={Settings} />
            </Switch>
            <div
              class={`modal ${state.modal.isActive ? 'is-active' : ''}`}
            >
              <div class='modal-background' />
              <div class='modal-content'>
                <section
                  class='section has-text-centered p-l-5 p-r-5'
                  key='TeamModalContainer'
                >
                  <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
                    {state.modal.content === 'AddTeam' ? (
                      <AddTeamForm />
                    ) : (
                      ''
                    )}
                  </div>
                </section>
              </div>
              <button
                class='modal-close is-large'
                onclick={() =>
                  actions.toggleModal('')
                }
                aria-label='close'
              />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return <Redirect to='/login' />
  }
}

export default TeamWrapper
