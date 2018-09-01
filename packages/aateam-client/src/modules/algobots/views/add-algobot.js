/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const AddAlgobotForm = props => (state, actions) => (
  <form name='addAlgobotForm' key='AddAlgobotForm'>
    <h1 class='title'>Add An Algobot</h1>
    <div class='field'>
      <label class='label'>Enter a algobot name</label>
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
          aria-label={state.algobot.createAlgobot.placeholder}
          oninput={({ target: { value } }) =>
            actions.algobot.checkAlgobotname(value)
          }
          onblur={({ target: { value } }) =>
            actions.algobot.checkAlgobotname(value)
          }
          value={state.algobot.createAlgobot.input}
          placeholder={state.algobot.createAlgobot.placeholder}
        />
        <span
          class={`icon is-small is-right ${
            state.algobot.createAlgobot.unique.input !== '' &&
            state.algobot.createAlgobot.unique
              ? 'has-text-success'
              : 'has-text-grey'
          }`}
        >
          <i class='fas fa-check' />
        </span>
      </div>
    </div>
    <p
      key='createAlgobotUniqueMessage'
      class={`has-text-centered ${
        !state.algobot.createAlgobot.unique ? 'has-text-danger' : 'is-invisible'
      }`}
    >
      This algobotname is already taken. Please create a new one.
    </p>
    <p
      key='addAlgobotMessage'
      class={`help is-size-4 m-t-hlf m-b-hlf
        ${
  state.algobot.form.form === 'addAlgobotSuccess'
    ? 'has-text-success'
    : ''
  }
        ${
  state.algobot.form.form === 'addAlgobotNotice'
    ? 'has-text-primary'
    : ''
  }
        ${
  state.algobot.form.form === 'addAlgobotError' ? 'has-text-danger' : ''
  }
        ${
  state.algobot.form.form === 'addAlgobotSuccess' ||
          state.algobot.form.form === 'addAlgobotNotice' ||
          state.algobot.form.form === 'addAlgobotError'
    ? ''
    : 'is-invisible'
  }`}
    >
      {state.algobot.form.message}
    </p>
    <div class='control buttons is-centered'>
      <input type='hidden' name='owner' value={state.user.profile.id} />
      <input type='hidden' name='team_id' value={state.team.profile.id} />
      <button
        onclick={e => actions.algobot.addAlgobot(e)}
        class='button is-link'
      >
        Create Algobot
      </button>
    </div>
  </form>
)

export default AddAlgobotForm
