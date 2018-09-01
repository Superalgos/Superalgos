/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect } from '@hyperapp/router'

import { ForgotPassForm } from '../../../../modules/auth/views'

export const ForgotPass = props => (state, actions) => {
  if (state.user.auth.loggedIn) {
    return <Redirect to='/dashboard' />
  }
  return (
    <section
      class='hero is-primary'
      key='ForgotPassContainer'
      oncreate={() => actions.auth.clearForms()}
    >
      <div class='container'>
        <div class='hero-head is-primary m-b-0' />
        <div class='hero-body m-t-0 is-marginless is-paddingless'>
          <div class='section m-b-0'>
            <div class='columns'>
              <div class='column is-6 is-offset-3'>
                <div class='box'>
                  <h1 class='title has-text-grey'>Forgot your password?</h1>
                  <ForgotPassForm />
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

export default ForgotPass
