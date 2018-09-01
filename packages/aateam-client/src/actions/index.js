import { action, log } from '@hyperapp/fx'
import { location } from '@hyperapp/router'

import { nav } from '../modules/nav/actions'
import { team } from '../modules/team/actions'
import { algobot } from '../modules/algobots/actions'
import { community } from '../modules/community/actions'

export const actions = {
  location: location.actions,
  isLoggedIn: authStatus => async (state, actions) => {
    authStatus.then((result) => {
      if (result) {
        actions.setLoggedIn(result)
        actions.redirect('dashboard')
      } else {
        actions.loggedIn(result)
        actions.redirect('/')
      }
    })
  },
  loggedIn: loggedIn => ({ loggedIn }),
  redirect: redirect => ({ redirect }),
  setLoggedIn: profile => [
    log('setLoggedIn', profile, window.location.pathname),
    action('loggedIn', true),
    action('setUserProfile', profile),
    action('redirect', window.location.pathname)
  ],
  setLoggedOut: () => [
    log('setLoggedOut', true),
    action('loggedIn', false),
    action('setUserProfileEmpty')
  ],
  setUserProfile: profile => {
    const user = {
      id: profile.sub,
      name: profile.name,
      username: profile.nickname,
      avatar: profile.picture,
      email: profile.email
    }
    return { user }
  },
  setUserProfileEmpty: () => ({ user: '' }),
  toggleModal: form => (state, actions) => {
    return {
      modal: {
        content: form,
        isActive: !state.modal.isActive
      }
    }
  },
  nav,
  team,
  algobot,
  community
}
