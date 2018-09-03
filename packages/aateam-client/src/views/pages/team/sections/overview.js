/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { TeamList } from '../../../../modules/team/views'

export const Overview = () => (state, actions) => {
  if (state.team.form.form === 'addTeamSuccess') actions.updateTeamView()

  return (
    <section
      class='section has-text-centered p-l-5 p-r-5'
      key='TeamOverviewContainer'
      oncreate={() => actions.team.getTeam(state.user.id)}
    >
      <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
        <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
          Team Overview
        </h1>
        <hr />
        <TeamList />
      </div>
    </section>
  )
}

export default Overview
