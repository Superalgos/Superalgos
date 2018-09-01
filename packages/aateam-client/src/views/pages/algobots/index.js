/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect, Switch, Route } from '@hyperapp/router'

import { Sidebar } from '../../nav/sidebar'
import { Algobots } from './sections'

import { AddAlgobotForm } from '../../../modules/algobots/views'

export const AlgobotWrapper = props => (state, actions) => {
  if (state.loggedIn) {
    const name =
      state.user.name === (undefined || null || '')
        ? 'friend'
        : state.user.name
    return (
      <div
        class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
        key='algobot-box'
      >
        <div class='columns is-gapless'>
          <div class='column is-2 is-navy'>
            <Sidebar />
          </div>
          <div class='column'>
            <Switch>
              <Route parent path='/algobots' render={Algobots} />
              <Route parent path='/algobots/manage' render={Algobots} />
              <Route parent path='/algobots/explore' render={Algobots} />
            </Switch>
            <div
              class={`modal ${state.algobot.modal.isActive ? 'is-active' : ''}`}
            >
              <div class='modal-background' />
              <div class='modal-content'>
                <section
                  class='section has-text-centered p-l-5 p-r-5'
                  key='AlgobotModalContainer'
                >
                  <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
                    {state.algobot.modal.content === 'AddAlgobot' ? (
                      <AddAlgobotForm />
                    ) : (
                      ''
                    )}
                  </div>
                </section>
              </div>
              <button
                class='modal-close is-large'
                onclick={() =>
                  actions.algobot.toggleModal(state.algobot.modal.content)
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

export default AlgobotWrapper
