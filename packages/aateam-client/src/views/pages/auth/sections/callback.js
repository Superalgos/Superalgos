/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link, Redirect } from '@hyperapp/router'

import { LoginForm } from '../../../../modules/auth/views'

export const Callback = props => (state, actions) => {
  if (state.loggedIn) {
    return <Redirect to='/dashboard' />
  }
  return (
    <section
      class='hero is-primary'
      key='LoginContainer'
      // oncreate={() => actions.auth.clearForms()}
    >
      <div class='container'>
        <div class='hero-head is-navy m-b-0' />
        <div class='hero-body m-t-0 is-marginless is-paddingless'>
          <div class='section m-b-0'>
            <div class='columns'>
              <div class='column is-6 is-offset-3'>
                <div class='box'>
                  <h1 class='title has-text-grey'><span class='icon has-text-primary is-large'>
                    <i class='fas fa-spinner fa-pulse' />
                  </span> Authenticating...</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class='hero-foot is-primary' />
      </div>
    </section>
  )
}

export default Callback
