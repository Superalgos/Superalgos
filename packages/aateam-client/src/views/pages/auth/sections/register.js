/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect } from '@hyperapp/router'

import { FinishRegisterWrapper } from './finish-register'
import { RegisterFormWrapper } from './register-form'
import { VerifyLoader } from './verify-loader'
import { FinishLoginLoaderLoader } from './finish-login-loader'

export const Register = ({ match }) => (state, actions) => {
  if (state.user.auth.loggedIn) {
    return <Redirect to='/dashboard' />
  }
  let token
  const param = document.URL.match(/verify=([a-zA-Z0-9.\-_]+)/)
  if (param !== null) {
    token =
      param.length > 0 && param[1] !== null && param[1] !== undefined
        ? param[1]
        : ''
  }

  return (
    <section
      class='hero is-primary'
      key='RegisterContainer'
      ondestroy={() => actions.auth.clearForms()}
    >
      <div class='container'>
        <div class='hero-head is-primary m-b-0' />
        <div class='hero-body m-t-0 is-marginless is-paddingless'>
          <div class='section m-b-0 p-b-5'>
            <div class='columns'>
              {param !== null && state.auth.form.form !== 'verifySuccess' ? (
                <VerifyLoader token={token} />
              ) : (
                ''
              )}
              {param !== null && state.auth.form.form !== 'finishSuccess' ? (
                <FinishRegisterWrapper />
              ) : (
                ''
              )}
              {param !== null && state.auth.form.form === 'finishSuccess' ? (
                <FinishLoginLoaderLoader />
              ) : (
                ''
              )}
              {param === null ? <RegisterFormWrapper /> : ''}
            </div>
          </div>
        </div>
        <div class='hero-foot is-primary' />
      </div>
    </section>
  )
}

export default Register
