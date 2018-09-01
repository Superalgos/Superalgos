/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import { RegisterForm } from '../../../../modules/auth/views'

export const RegisterFormWrapper = () => (
  <div class='column is-8 is-offset-2' key='RegisterFormWrapper'>
    <div class='box'>
      <div class='section p-t-3 p-b-3 p-l-5 p-r-5 has-text-centered'>
        <h1 class='title has-text-grey'>Join the AlgoCommunity</h1>
        <p class='is-size-4 m-b-2'>
          Enter your email address and further instructions will be sent to you
        </p>
        <RegisterForm />
        <p class='has-text-italic m-t-2'>
          Your email will not be added to any mailing lists.
        </p>
        <p class='m-t-2'>
          Already have an account?{' '}
          <Link to='/login' class='is-link is-size-6 has-text-primary'>
            Login.
          </Link>
        </p>
      </div>
    </div>
  </div>
)
