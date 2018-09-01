/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link, Redirect } from '@hyperapp/router'

import { LoginForm } from '../../../../modules/auth/views'

export const Login = props => (state, actions) => {
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
        <div class='hero-head is-primary m-b-0' />
        <div class='hero-body m-t-0 is-marginless is-paddingless'>
          <div class='section m-b-0'>
            <div class='columns'>
              <div class='column is-6 is-offset-3'>
                <div class='box'>
                  <h1 class='title has-text-grey'>Login</h1>
                  <LoginForm />
                  <p class='m-t-2'>
                    Don't have an account?{' '}
                    <Link
                      to='/register'
                      class='is-link is-size-6 has-text-primary'
                    >
                      Create one!
                    </Link>
                  </p>
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

export default Login
