/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { RegisterForm } from '../../../../modules/auth/views'

export const VerifyLoader = ({ token }) => (state, actions) => (
  <div
    class='column is-6 is-offset-3'
    key='VerifyLoaderWrapper'
    oncreate={() => {
      if (token !== null && token !== '') {
        actions.auth.verifyRegister(token)
      }
    }}
  >
    <div class='box'>
      <div class='section  p-t-3 p-b-3 p-l-3 p-r-3'>
        <h1 class='title has-text-grey'>{state.auth.form.message}</h1>
      </div>
    </div>
  </div>
)
