/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const FinishRegisterForm = props => (state, actions) => (
  <form name='finishRegisterForm' key='finishRegisterForm'>
    <div class='field'>
      <label class='label'>New Username:</label>
      <div class='control has-icons-left has-icons-right'>
        <input
          name='new-username'
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
          aria-label={state.auth.createUsername.placeholder}
          oninput={({ target: { value } }) => actions.auth.checkUsername(value)}
          onblur={({ target: { value } }) => actions.auth.checkUsername(value)}
          value={state.auth.createUsername.input}
          placeholder={state.auth.createUsername.placeholder}
        />
        <span
          key='createUsernameUserIcon'
          class={`icon is-small is-left ${
            state.auth.createUsername.unique ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-user' />
        </span>
        <span
          key='createUsernameCheckIcon'
          class={`icon is-small is-right ${
            state.auth.createUsername.unique ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-check' />
        </span>
        <p
          key='createUsernameUniqueMessage'
          class={`m-t-1 has-text-centered ${
            state.auth.createUsername.input !== '' &&
            state.auth.createUsername.error !== null &&
            state.auth.createUsername.error !== '' &&
            !state.auth.createUsername.unique
              ? 'has-text-danger'
              : 'is-invisible'
          }`}
        >
          This username is already taken. Please create a new one.
        </p>
      </div>
    </div>
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
          aria-label={state.auth.createPassword.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.createPassword.input(value)
          }
          onblur={({ target: { value } }) =>
            actions.auth.createPassword.input(value)
          }
          value={state.auth.createPassword.input}
          placeholder={state.auth.createPassword.placeholder}
        />
        <span
          key='createPasswordLockIcon'
          class={`icon is-small is-left
          ${
  state.auth.createPassword.strength === 'weak'
    ? 'has-text-danger'
    : ''
  }
          ${
  state.auth.createPassword.strength === 'medium'
    ? 'has-text-warning'
    : ''
  }
          ${
  state.auth.createPassword.strength === 'strong'
    ? 'has-text-success'
    : ''
  }
        `}
        >
          <i class='fas fa-lock' />
        </span>
        <span
          key='createPasswordCheckIcon'
          class={`icon is-small is-right ${
            state.auth.createPassword.strength === 'strong'
              ? 'has-text-success'
              : ''
          }`}
        >
          <i class='fas fa-check' />
        </span>
        <p
          key='createPasswordStrengthMessage'
          class={`m-t-1 has-text-centered ${
            state.auth.createPassword.strength !== null &&
            state.auth.createPassword.input !== ''
              ? 'has-text-primary'
              : 'is-invisible'
          }`}
        >
          Password strength is {state.auth.createPassword.strength}
        </p>
        <p
          key='createPasswordStrengthMessage2'
          class={`m-t-1 has-text-centered ${
            state.auth.createPassword.strength === 'weak' ||
            state.auth.createPassword.strength === 'medium'
              ? 'has-text-primary'
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
          aria-label={state.auth.confirmPassword.placeholder}
          oninput={({ target: { value } }) =>
            actions.auth.confirmPassword.input({
              value: value,
              confirm: state.auth.createPassword.input
            })
          }
          onblur={({ target: { value } }) =>
            actions.auth.confirmPassword.input({
              value: value,
              confirm: state.auth.createPassword.input
            })
          }
          value={state.auth.confirmPassword.input}
          placeholder={state.auth.confirmPassword.placeholder}
        />
        <span
          key='confirmPasswordLockIcon'
          class={`icon is-small is-left
          ${
  state.auth.confirmPassword.strength === 'weak'
    ? 'has-text-danger'
    : ''
  }
          ${
  state.auth.confirmPassword.strength === 'medium'
    ? 'has-text-warning'
    : ''
  }
          ${
  state.auth.confirmPassword.strength === 'strong'
    ? 'has-text-success'
    : ''
  }
        `}
        >
          <i class='fas fa-lock' />
        </span>
        <span
          key='confirmPasswordCheckIcon'
          class={`icon is-small is-right ${
            state.auth.confirmPassword.matches ? 'has-text-success' : ''
          }`}
        >
          <i class='fas fa-check' />
        </span>
        <p
          key='confirmPasswordMatchesMessage'
          class={`m-t-1 has-text-centered ${
            state.auth.confirmPassword.matches
              ? 'has-text-primary'
              : 'is-invisible'
          }`}
        >
          Passwords match!
        </p>
      </div>
    </div>
    <p
      key='finishRegisterMessage'
      class={`help 
        ${state.auth.finishRegister.success ? 'has-text-success' : ''}
        ${state.auth.finishRegister.error ? 'has-text-danger' : ''}
        ${state.auth.finishRegister.load ? 'has-text-primary' : ''}
        ${
  (state.auth.finishRegister.load ||
            state.auth.finishRegister.error ||
            state.auth.finishRegister.success) &&
          state.auth.finishRegister.success !== ''
    ? 'is-size-4 m-t-hlf m-b-hlf'
    : 'is-invisible'
  }`}
    >
      {state.auth.finishRegister.message}
    </p>
    <div class='control buttons is-centered'>
      <input
        type='hidden'
        name='email'
        value={state.auth.registerEmail.input}
      />
      <button
        onclick={e => actions.auth.finish(e)}
        class={`button is-primary ${
          state.auth.finishRegister.load ? 'is-loading' : ''
        }`}
        aria-label='Finish Account Creation'
        disabled={
          !(
            state.auth.createUsername.unique &&
            state.auth.createPassword.strength === 'strong' &&
            state.auth.confirmPassword.matches
          )
        }
      >
        Finish Account Creation
      </button>
    </div>
  </form>
)

export default FinishRegisterForm
