/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { TeamsList } from './teams-list'

export const TeamsListWrapper = () => (state, actions) => (
  <section
    class='section has-text-centered p-l-3 p-r-3'
    key='DashboardContainer'
    oncreate={() => actions.community.getTeams()}
  >
    <div class='section m-b-0'>
      <div class='card'>
        <div class='card-content has-text-centered'>
          <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
            Community Teams
          </h1>
          <TeamsList />
        </div>
      </div>
    </div>
  </section>
)

export default TeamsListWrapper
