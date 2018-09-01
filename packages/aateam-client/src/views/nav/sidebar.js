/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

export const Sidebar = ({ match }) => (state, actions) => (
  <aside class='menu section is-navy'>
    <ul class='menu-list'>
      <li>
        <Link
          to='/dashboard'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/dashboard' ? 'is-active' : ''
          }`}
        >
          Dashboard
        </Link>
      </li>
    </ul>
    <p class='menu-label'> Team </p>
    <ul class='menu-list'>
      <li>
        <Link
          to='/team'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/team' ? 'is-active' : ''
          }`}
        >
          Overview
        </Link>
      </li>
      <li>
        <Link
          to='/algobots'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/algobots' ? 'is-active' : ''
          }`}
        >
          Algobots
        </Link>
      </li>
      <li>
        <Link
          to='/team/members'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/team/members' ? 'is-active' : ''
          }`}
        >
          Members
        </Link>
      </li>
      <li>
        <Link
          to='/team/settings'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/team/settings' ? 'is-active' : ''
          }`}
        >
          Settings
        </Link>
      </li>
    </ul>
  </aside>
)

export default Sidebar
