/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import { auth } from '../../../index'

import { NavUserInfo } from './user-info'

export const NavButtonsLoggedIn = ({ match }) => (state, actions) => (
  <div
    class={`navbar-item is-hoverable ${
      state.nav.top.mobileMenu ? 'is-active' : ''
    }`}
  >
    <NavUserInfo />
    <div class='navbar-dropdown is-right'>
      <Link
        to='/profile'
        class={`navbar-item ${
          state.location.pathname === '/profile' ? 'is-active' : ''
        }`}
      >
        My Profile
      </Link>
      <Link
        to='/settings'
        class={`navbar-item ${
          state.location.pathname === '/settings' ? 'is-active' : ''
        }`}
      >
        Settings
      </Link>
      <Link
        to='/support'
        class={`navbar-item ${
          state.location.pathname === '/support' ? 'is-active' : ''
        }`}
      >
        Support
      </Link>
      <hr class='navbar-divider' />
      <a class='navbar-item' onclick={() => auth.logout()}>
        <span class='icon'>
          <i class='fas fa-sign-out-alt' />
        </span>
        Log Out
      </a>
    </div>
  </div>
)

export const NavButtonsLoggedInMobile = ({ match }) => (state, actions) => (
  <div class='navbar-item'>
    <hr class='navbar-divider' />
    <Link
      to='/profile'
      class={`navbar-item ${
        state.location.pathname === '/profile' ? 'is-active' : ''
      }`}
    >
      My Profile
    </Link>
    <Link
      to='/settings'
      class={`navbar-item ${
        state.location.pathname === '/settings' ? 'is-active' : ''
      }`}
    >
      Settings
    </Link>
    <Link
      to='/support'
      class={`navbar-item ${
        state.location.pathname === '/support' ? 'is-active' : ''
      }`}
    >
      Support
    </Link>
    <hr class='navbar-divider' />
    <a class='navbar-item' onclick={() => auth.logout()}>
      <span class='icon'>
        <i class='fas fa-sign-out-alt' />
      </span>
      Log Out
    </a>
  </div>
)

export const NavButtonsLoggedOut = ({ match }) => (state, actions) => (
  <div class='navbar-item'>
    <a class='navbar-item button is-red' onclick={() => auth.login()}>
      Sign up or Login
    </a>
  </div>
)
