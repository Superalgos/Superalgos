/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { AddAlgobotForm } from '../../../../modules/algobots/views'

export const AddAlgobotWrapper = () => (state, actions) => (
  <div class='box' key='AddTeamWrapper'>
    <div class='section p-t-3 p-b-3 p-l-5 p-r-5 has-text-centered'>
      <h1 class='title has-text-grey'>Fork an Algobot</h1>
      <p class='is-size-4 m-b-2'>Enter a desired algobot name</p>
      <AddAlgobotForm />
    </div>
  </div>
)

export default AddAlgobotWrapper
