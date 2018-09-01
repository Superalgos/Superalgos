/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { DashboardSteps } from '../../../../modules/onboard/views/dashboard-steps'
import { TeamPanel } from '../../../../modules/team/views'
import { AlgobotPanel } from '../../../../modules/algobots/views'
import AlgonetWebPlatform from '../../../../assets/AlgonetWebPlatform.jpg'

export const Dashboard = () => (state, actions) => (
  <section
    class='section has-text-centered p-l-3 p-r-3'
    key='DashboardContainer'
  >
    <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
      Dashboard
    </h1>
    <div class='section m-t-0 m-r-hlf'>
      <div class='tile is-ancestor'>
        <div class='tile is-parent is-vertical is-4'>
          <div
            class='tile is-child card'
            oncreate={() => actions.team.getTeam(state.user.id)}
          >
            <div class='card-content has-text-centered is-marginless is-paddingless'>
              <TeamPanel />
            </div>
          </div>
          <div
            class='tile is-child card is-marginless is-paddingless'
            oncreate={() => actions.algobot.getAlgobots(state.user.id)}
          >
            <div class='card-content has-text-centered is-marginless is-paddingless'>
              <AlgobotPanel />
            </div>
          </div>
        </div>
        <div class='tile is-parent is-8'>
          <div class='tile is-child card'>
            <div class='card-image'>
              <img
                src={AlgonetWebPlatform}
                with='1024'
                height='588'
                alt='Advanced Algos Development Platform'
              />
            </div>
            <div class='card-content has-text-centered'>
              <h2 class='title is-size-4'>Develop</h2>
            </div>
            <div class='card-footer'>
              <p class='card-footer-item buttons is-left'>
                <a
                  href='http://aawebdevelop.azurewebsites.net/index.html'
                  class='button is-grey'
                >
                  Quick Start
                </a>
                <a
                  href='http://aawebdevelop.azurewebsites.net/index.html'
                  class='button is-grey'
                >
                  Documentation
                </a>
              </p>
              <p class='card-footer-item buttons is-right'>
                <a
                  href='http://aawebdevelop.azurewebsites.net/index.html'
                  class='button is-red'
                >
                  Go to Development Platform &rarr;
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default Dashboard
