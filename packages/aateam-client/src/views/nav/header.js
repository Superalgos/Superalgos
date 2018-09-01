/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import { MainMenu, MobileMenu } from './components/main-menu'

import logo from '../../assets/logos/advanced-algos/aa-logo.png'

export const Nav = ({ match }) => (state, actions) => {
  if (state.user) {
    return (
      <nav
        class='navbar'
        role='navigation'
        aria-label='main navigation'
        key='nav-container'
      >
        <div class='navbar-brand'>
          <Link to='/' class='navbar-item'>
            <img
              src={logo}
              alt='Advanced Algos'
              class=''
              width='240'
              height='48'
            /> <span class='title is-size-3 p-l-1 has-text-weight-light is-uppercase'>Teams Module</span>
          </Link>
          <div class='navbar-item'>
            <h1 class='title has-text-weight-light is-size-4' />
          </div>
          <div
            class='navbar-burger burger'
            data-target='navbarMobile'
            onclick={actions.nav.top.toggleMobileMenu}
          >
            <span />
            <span />
            <span />
          </div>
        </div>
        <div
          id='navbarMobile'
          class={`navbar-menu ${state.nav.top.mobileMenu ? 'is-active' : ''}`}
        >
          <div class='navbar-start' />
          {state.nav.top.mobileMenu ? <MobileMenu /> : <MainMenu />}
        </div>
      </nav>
    )
  }
}
