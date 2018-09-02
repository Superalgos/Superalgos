/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect } from '@hyperapp/router'

import { Sidebar } from '../../nav/sidebar'
import { Dashboard } from './sections'

import { AddTeamForm } from '../../../modules/team/views'

export const DashboardWrapper = props => (state, actions) => {
  if (state.team.form.form === 'addTeamSuccess') actions.updateTeamView()
  if (state.loggedIn) {
    const name =
      state.user.name === (undefined || null || '')
        ? 'friend'
        : state.user.name
    return (
      <div
        class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
        key='dashboard-box'
        // oncreate={() => actions.auth.clearForms()}
      >
        <div class='columns is-gapless'>
          <div class='column is-2 is-navy'>
            <Sidebar />
          </div>
          <div class='column is-light'>
            <Dashboard />
            <div
              class={`modal ${
                state.modal.isActive
                  ? 'is-active'
                  : ''
              }`}
            >
              <div class='modal-background' />
              <div class='modal-content'>
                <section
                  class='section has-text-centered p-l-5 p-r-5'
                  key='ProfileContainer'
                >
                  <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
                    {state.modal.content === 'AddTeam' &&
                    state.modal.isActive ? (
                        <AddTeamForm />
                      ) : (
                        ''
                      )}
                  </div>
                </section>
              </div>
              <button
                class='modal-close is-large'
                onclick={() => actions.toggleModal('')}
                aria-label='close'
              />
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return <Redirect to='/' />
  }
}

export default DashboardWrapper
