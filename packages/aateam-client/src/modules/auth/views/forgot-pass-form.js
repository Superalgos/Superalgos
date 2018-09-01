/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

export const ForgotPassForm = props => (state, actions) => (
  <form name='forgotPassForm' key='forgotPassForm'>
    <div class='field'>
      <label class='label'>Enter your Email Address</label>
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
          aria-label={state.auth.forgotEmail.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.forgotEmail.input(value)
          }
          value={state.auth.forgotEmail.input}
          placeholder={state.auth.forgotEmail.placeholder}
        />
        <span
          class={`icon is-small is-left ${
            state.auth.forgotEmail.valid ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-user' />
        </span>
        <span
          class={`icon is-small is-right ${
            state.auth.forgotEmail.valid
              ? 'has-text-success'
              : 'has-text-light-grey'
          }`}
        >
          <i class='fas fa-check' />
        </span>
      </div>
      <p
        class={`help is-size-4 m-t-hlf m-b-hlf
        ${state.auth.form.form === 'forgotPassLoad' ? 'is-primary' : ''}
        ${state.auth.form.form === 'forgotPassSuccess' ? 'is-success' : ''}
        ${state.auth.form.form === 'forgotPassError' ? 'is-danger' : ''}
        ${
  state.auth.form.form === 'forgotPassLoad' ||
          state.auth.form.form === 'forgotPassSuccess' ||
          state.auth.form.form === 'forgotPassError'
    ? ''
    : 'is-invisible'
  }`}
      >
        {state.auth.form.message}
      </p>
    </div>
    <div class='control'>
      <button
        onclick={e => actions.auth.forgotPass(e)}
        class={`button is-primary ${
          state.auth.form.form === 'forgotPassLoad' ? 'is-loading' : ''
        }`}
        aria-label='Send New Password'
        disabled={state.auth.form.form === 'forgotPassLoad'}
      >
        Submit
      </button>
      <Link to='/login' class='is-link is-size-6 is-pulled-right'>
        Back to Login &rarr;
      </Link>
    </div>
  </form>
)

export default ForgotPassForm
