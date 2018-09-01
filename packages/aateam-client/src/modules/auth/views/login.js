/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

export const LoginForm = props => (state, actions) => (
  <form name='loginForm' key='LoginForm'>
    <div class='field'>
      <label class='label'>Username or Email</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          class='input'
          type='text'
          autocomplete='username'
          onupdate={(element, oldAttributes) => {
            if (
              oldAttributes.value !== element.value ||
              (oldAttributes.value !== '' && element.value === '')
            ) {
              element.focus()
            }
          }}
          aria-label={state.auth.username.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.username.input(value)
          }
          value={state.auth.username.input}
          placeholder={state.auth.username.placeholder}
        />
        <span class='icon is-small is-left'>
          <i class='fas fa-user' />
        </span>
        <span class='icon is-small is-right is-invisible'>
          <i class='fas fa-check' />
        </span>
      </div>
    </div>

    <div class='field'>
      <label class='label'>Password</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          class='input'
          type='password'
          autocomplete='current-password'
          onupdate={(element, oldAttributes) => {
            if (
              oldAttributes.value !== element.value ||
              (oldAttributes.value !== '' && element.value === '')
            ) {
              element.focus()
            }
          }}
          aria-label={state.auth.password.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.password.input(value)
          }
          value={state.auth.password.input}
          placeholder={state.auth.password.placeholder}
        />
        <span class='icon is-small is-left'>
          <i class='fas fa-lock' />
        </span>
        <span
          class={`icon is-small is-right ${
            state.user.form.form === 'loginError' ? '' : 'is-invisible'
          }`}
        >
          <i class='fas fa-exclamation-triangle' />
        </span>
      </div>
      <p
        key='loginMessage'
        class={`help is-size-4 m-t-hlf m-b-hlf
        ${state.user.form.form === 'loginSuccess' ? 'has-text-success' : ''}
        ${state.user.form.form === 'loginNotice' ? 'has-text-primary' : ''}
        ${state.user.form.form === 'loginError' ? 'has-text-danger' : ''}
        ${
  state.user.form.form === 'loginSuccess' ||
          state.user.form.form === 'loginNotice' ||
          state.user.form.form === 'loginError'
    ? ''
    : 'is-invisible'
  }`}
      >
        {state.user.form.message}
      </p>
    </div>
    <div class='control'>
      <button onclick={e => actions.user.loginSubmit(e)} class='button is-link'>
        Submit
      </button>
      <Link to='/forgot-pass' class='is-link is-size-6 is-pulled-right'>
        Forgot password?
      </Link>
    </div>
  </form>
)

export default LoginForm
