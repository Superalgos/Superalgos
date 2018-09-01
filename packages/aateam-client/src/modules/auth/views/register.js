/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const RegisterForm = props => (state, actions) => (
  <form name='registerForm' key='registerForm'>
    <div class='field'>
      <label class='label'>Email Address</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          class='input'
          type='text'
          onupdate={(element, oldAttributes) => {
            if (
              oldAttributes.value !== element.value ||
              (oldAttributes.value !== '' && element.value === '')
            ) {
              element.focus()
            }
          }}
          aria-label={state.auth.email.placeholder}
          oninput={({ target: { value } }) => actions.auth.email.input(value)}
          value={state.auth.email.input}
          placeholder={state.auth.email.placeholder}
        />
        <span
          class={`icon is-small is-left ${
            state.auth.email.valid ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-user' />
        </span>
        <span
          class={`icon is-small is-right ${
            state.auth.email.valid ? 'has-text-success' : 'has-text-light-grey'
          }`}
        >
          <i class='fas fa-check' />
        </span>
      </div>
      <p
        class={`help is-size-4 m-t-hlf m-b-hlf
        ${state.auth.form.form === 'registerLoad' ? 'is-primary' : ''}
        ${state.auth.form.form === 'registerSuccess' ? 'is-success' : ''}
        ${state.auth.form.form === 'registerError' ? 'is-danger' : ''}
        ${
  state.auth.form.form === 'registerLoad' ||
          state.auth.form.form === 'registerSuccess' ||
          state.auth.form.form === 'registerError'
    ? ''
    : 'is-invisible'
  }`}
      >
        {state.auth.form.message}
      </p>
    </div>
    <div class='control buttons is-centered'>
      <button
        onclick={e => actions.auth.register(e)}
        class={`button is-primary ${
          state.auth.form.form === 'registerLoad' ? 'is-loading' : ''
        }`}
        aria-label='Register'
        disabled={state.auth.form.form === 'registerLoad'}
      >
        Register
      </button>
    </div>
  </form>
)

export default RegisterForm
