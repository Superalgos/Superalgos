/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { AddTeamForm } from '../../../../modules/team/views'

export const AddTeamWrapper = () => (state, actions) => (
  <div class='box' key='AddTeamWrapper'>
    <div class='section p-t-3 p-b-3 p-l-5 p-r-5 has-text-centered'>
      <h1 class='title has-text-grey'>Create an Algo Team</h1>
      <p class='is-size-4 m-b-2'>Enter a desired team name</p>
      <AddTeamForm />
    </div>
  </div>
)

export default AddTeamWrapper
