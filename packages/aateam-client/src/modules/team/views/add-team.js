/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const AddTeamForm = props => (state, actions) => (
  <form name='addTeamForm' key='AddTeamForm'>
    <h1 class='title'>Add A Team</h1>
    <div class='field'>
      <label class='label'>Enter a team name</label>
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
          aria-label={state.team.createTeam.placeholder}
          oninput={({ target: { value } }) => actions.team.checkTeamname(value)}
          onblur={({ target: { value } }) => actions.team.checkTeamname(value)}
          value={state.team.createTeam.input}
          placeholder={state.team.createTeam.placeholder}
        />
        <span
          class={`icon is-small is-right ${
            state.team.createTeam.unique.input !== '' &&
            state.team.createTeam.unique
              ? 'has-text-success'
              : 'has-text-grey'
          }`}
        >
          <i class='fas fa-check' />
        </span>
      </div>
    </div>
    <p
      key='createTeamUniqueMessage'
      class={`has-text-centered ${
        !state.team.createTeam.unique ? 'has-text-danger' : 'is-invisible'
      }`}
    >
      This teamname is already taken. Please create a new one.
    </p>
    <p
      key='addTeamMessage'
      class={`help is-size-4 m-t-hlf m-b-hlf
        ${state.team.form.form === 'addTeamSuccess' ? 'has-text-success' : ''}
        ${state.team.form.form === 'addTeamNotice' ? 'has-text-primary' : ''}
        ${state.team.form.form === 'addTeamError' ? 'has-text-danger' : ''}
        ${
  state.team.form.form === 'addTeamSuccess' ||
          state.team.form.form === 'addTeamNotice' ||
          state.team.form.form === 'addTeamError'
    ? ''
    : 'is-invisible'
  }`}
    >
      {state.team.form.message}
    </p>
    <div class='control buttons is-centered'>
      <input type='hidden' name='owner' value={state.user.id} />
      <button onclick={e => actions.team.addTeam(e)} class='button is-link'>
        Create Team
      </button>
    </div>
  </form>
)

export default AddTeamForm
