/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const DashboardSteps = props => (state, actions) => (
  <ul class='steps is-narrow is-medium is-centered has-content-centered'>
    <li class='steps-segment'>
      <a href='#' class='has-text-dark'>
        <span class='steps-marker has-text-white'>
          <span class='icon'>
            <i class='fa fa-users' />
          </span>
        </span>
        <div class='steps-content'>
          <p class='heading'>Create A Team</p>
        </div>
      </a>
    </li>
    <li class='steps-segment'>
      <a hef='#' class='has-text-dark'>
        <span class='steps-marker has-text-white'>
          <span class='icon'>
            <i class='fa fa-robot' />
          </span>
        </span>
        <div class='steps-content'>
          <p class='heading'>Name Your Algobot</p>
        </div>
      </a>
    </li>
    <li class='steps-segment is-active has-gaps'>
      <a hef='#' class='has-text-dark has-text-white'>
        <span class='steps-marker has-text-dark'>
          <span class='icon'>
            <i class='fa fa-code' />
          </span>
        </span>
        <div class='steps-content'>
          <p class='heading'>Develop</p>
        </div>
      </a>
    </li>
    <li class='steps-segment'>
      <a hef='#' class='has-text-dark'>
        <span class='steps-marker is-hollow'>
          <span class='icon'>
            <i class='fa fa-trophy' />
          </span>
        </span>
        <div class='steps-content'>
          <p class='heading'>Compete</p>
        </div>
      </a>
    </li>
  </ul>
)

export default DashboardSteps
