/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import {
  NavButtonsLoggedIn,
  NavButtonsLoggedInMobile,
  NavButtonsLoggedOut
} from './nav-buttons'

export const MainMenu = ({ match }) => (state, actions) => (
  <div class='navbar-end'>
    <Link
      to='/'
      class={`navbar-item is-size-5 ${
        state.location.pathname === '/' ? 'is-active' : ''
      }`}
    >
      <span
        class={`icon is-large ${
          state.location.pathname === '/'
            ? 'is-active has-text-primary'
            : 'has-text-grey '
        }`}
      >
        <i class='fas fa-home' />
      </span>
    </Link>
    <Link
      to='/teams'
      class={`navbar-item is-size-5 ${
        state.location.pathname === '/teams' ? 'is-active' : ''
      }`}
    >
      Teams
    </Link>
    {state.loggedIn ? (
      <Link
        to='/dashboard'
        class={`navbar-item is-size-5 ${
          state.location.pathname === '/dashboard' ? 'is-active' : ''
        }`}
      >
        Dashboard
      </Link>
    ) : (
      ''
    )}
    {state.loggedIn ? (
      <NavButtonsLoggedIn />
    ) : (
      <NavButtonsLoggedOut />
    )}
  </div>
)

export const MobileMenu = ({ match }) => (state, actions) => (
  <div class='navbar-end'>
    <Link
      to='/'
      class={`navbar-item is-size-5 ${
        state.location.pathname === '/' ? 'is-active' : ''
      }`}
    >
      Home
    </Link>
    <Link
      to='/teams'
      class={`navbar-item is-size-5 ${
        state.location.pathname === '/teams' ? 'is-active' : ''
      }`}
    >
      Teams
    </Link>
    {state.loggedIn ? (
      <Link
        to='/dashboard'
        class={`navbar-item is-size-5 ${
          state.location.pathname === '/dashboard' ? 'is-active' : ''
        }`}
      >
        Dashboard
      </Link>
    ) : (
      ''
    )}
    {state.loggedIn ? (
      <NavButtonsLoggedInMobile />
    ) : (
      <NavButtonsLoggedOut />
    )}
  </div>
)
