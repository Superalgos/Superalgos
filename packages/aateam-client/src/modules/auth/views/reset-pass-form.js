/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const ResetPassForm = ({ token }) => (state, actions) => (
  <form name='resetPassForm' key='resetPassForm'>
    <div class='field'>
      <label class='label'>New Password:</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          name='new-password'
          class='input'
          type='password'
          autocomplete='new-password'
          onupdate={(element, oldAttributes) => {
            if (
              oldAttributes.value !== element.value ||
              (oldAttributes.value !== '' && element.value === '')
            ) {
              element.focus()
            }
          }}
          aria-label={state.auth.resetPassword.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.resetPassword.input(value)
          }
          onblur={({ target: { value } }) =>
            actions.auth.resetPassword.input(value)
          }
          value={state.auth.resetPassword.input}
          placeholder={state.auth.resetPassword.placeholder}
        />
        <span
          key='resetPasswordLockIcon'
          class={`icon is-small is-left
          ${
  state.auth.resetPassword.strength === 'weak'
    ? 'has-text-danger'
    : ''
  }
          ${
  state.auth.resetPassword.strength === 'medium'
    ? 'has-text-warning'
    : ''
  }
          ${
  state.auth.resetPassword.strength === 'strong'
    ? 'has-text-success'
    : ''
  }
        `}
        >
          <i class='fas fa-lock' />
        </span>
        <span
          key='resetPasswordCheckIcon'
          class={`icon is-small is-right ${
            state.auth.resetPassword.strength === 'strong'
              ? 'has-text-success'
              : ''
          }`}
        >
          <i class='fas fa-check' />
        </span>
        <p
          key='resetPasswordStrengthMessage'
          class={`${
            state.auth.resetPassword.strength !== null &&
            state.auth.resetPassword.input !== ''
              ? 'm-t-1 has-text-centered has-text-primary'
              : 'is-invisible'
          }`}
        >
          Password strength is {state.auth.resetPassword.strength}
        </p>
        <p
          key='resetPasswordStrengthMessage2'
          class={`${
            state.auth.resetPassword.strength === 'weak' ||
            state.auth.resetPassword.strength === 'medium'
              ? 'm-t-1 has-text-centered has-text-primary'
              : 'is-invisible'
          }`}
        >
          <span class='is-italic is-size-6'>
            At least 10 characters, upper &amp; lower case letters<br />+ a
            number + a special char [! @ # $ % ^ &amp; *]
          </span>
        </p>
      </div>
    </div>
    <div class='field'>
      <label class='label'>Confirm Password:</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          name='confirm-password'
          class='input'
          type='password'
          autocomplete='new-confirm-password'
          onupdate={(element, oldAttributes) => {
            if (
              oldAttributes.value !== element.value ||
              (oldAttributes.value !== '' && element.value === '')
            ) {
              element.focus()
            }
          }}
          aria-label={state.auth.confirmResetPassword.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.confirmResetPassword.input({
              value: value,
              confirm: state.auth.resetPassword.input
            })
          }
          onblur={({ target: { value } }) =>
            actions.auth.confirmResetPassword.input({
              value: value,
              confirm: state.auth.resetPassword.input
            })
          }
          value={state.auth.confirmResetPassword.input}
          placeholder={state.auth.confirmResetPassword.placeholder}
        />
        <span
          key='confirmResetPasswordLockIcon'
          class={`icon is-small is-left
          ${
  state.auth.confirmResetPassword.strength === 'weak'
    ? 'has-text-danger'
    : ''
  }
          ${
  state.auth.confirmResetPassword.strength === 'medium'
    ? 'has-text-warning'
    : ''
  }
          ${
  state.auth.confirmResetPassword.strength === 'strong'
    ? 'has-text-success'
    : ''
  }
        `}
        >
          <i class='fas fa-lock' />
        </span>
        <span
          key='confirmResetPasswordCheckIcon'
          class={`icon is-small is-right ${
            state.auth.confirmResetPassword.matches ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-check' />
        </span>
        <p
          key='confirmResetPasswordMatchesMessage'
          class={`${
            state.auth.confirmResetPassword.matches
              ? 'm-t-1 has-text-centered has-text-primary'
              : 'is-invisible'
          }`}
        >
          Passwords match!
        </p>
      </div>
    </div>
    <p
      key='resetPassMessage'
      class={`help
        ${state.auth.form.form === 'resetPassDone' ? 'has-text-success' : ''}
        ${state.auth.form.form === 'resetPassError' ? 'has-text-danger' : ''}
        ${
  state.auth.form.form === 'resetPassDone' ||
          state.auth.form.form === 'resetPassError' ||
          state.auth.form.form === 'resetPassLoad'
    ? ' is-size-4 m-t-hlf m-b-hlf has-text-centered'
    : 'is-invisible'
  }`}
    >
      {state.auth.form.message}
    </p>
    <div class='control buttons is-centered'>
      <input type='hidden' name='token' value={token} />
      <button
        onclick={e => actions.auth.resetPass(e)}
        class={`button is-primary ${
          state.auth.form.form === 'resetPassLoad' ? 'is-loading' : ''
        }`}
        disabled={
          !(
            state.auth.resetPassword.strength === 'strong' &&
            state.auth.confirmResetPassword.matches
          )
        }
      >
        Reset Password
      </button>
    </div>
  </form>
)

export default ResetPassForm
