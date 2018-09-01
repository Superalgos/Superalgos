/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect } from '@hyperapp/router'

import { ResetPassForm } from '../../../../modules/auth/views'

export const ResetPass = ({ match }) => (state, actions) => {
  if (state.user.auth.loggedIn) {
    return <Redirect to='/dashboard' />
  }
  if (state.auth.form.form === 'resetPassSuccess') {
    return <Redirect to='/login' />
  }
  let token
  const param = document.URL.match(/verify=([a-zA-Z0-9.\-_]+)/)
  if (param !== null) {
    token =
      param.length > 0 && param[1] !== null && param[1] !== undefined
        ? param[1]
        : ''
  }
  console.log('pages.auth.reset-pass: ', token)
  return (
    <section
      class='hero is-success'
      key='ResetPassContainer'
      oncreate={() => actions.auth.clearForms()}
    >
      <div class='container'>
        <div class='hero-head is-primary m-b-0' />
        <div class='hero-body m-t-0 is-marginless is-paddingless'>
          <div class='section m-b-0 p-b-5'>
            <div class='columns'>
              <div class='column is-6 is-offset-3'>
                <div class='box'>
                  <h1 class='title has-text-grey'>Reset your password</h1>
                  <ResetPassForm token={token} />
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

export default ResetPass
