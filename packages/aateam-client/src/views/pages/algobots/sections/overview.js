/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { AlgobotList } from '../../../../modules/algobots/views'

export const Overview = () => (state, actions) => (
  <section
    class='section has-text-centered p-l-5 p-r-5'
    key='AlgobotOverviewContainer'
    // oncreate={() => actions.algobot.getAlgobots(state.user.id)}
  >
    <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
      <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
        Algobot Overview
      </h1>
      <hr />
      <AlgobotList />
    </div>
  </section>
)

export default Overview
