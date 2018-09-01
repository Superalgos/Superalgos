/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const FinishLoginLoaderLoader = ({ token }) => (state, actions) => (
  <div
    class='column is-6 is-offset-3'
    key='FinishLoginLoaderLoaderWrapper'
    oncreate={() => {
      if (token !== null && token !== '') {
        actions.user.loginRegister({
          username: state.auth.createUsername.input,
          password: state.auth.createPassword.input
        })
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
