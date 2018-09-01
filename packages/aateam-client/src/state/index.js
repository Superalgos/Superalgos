import { location } from '@hyperapp/router'
import { getStateFromStorage } from '../utils/local-storage'

import auth from '../modules/auth/state'
import nav from '../modules/nav/state'
import team from '../modules/team/state'
import algobot from '../modules/algobots/state'
import community from '../modules/community/state'

const appVersion = '0.0.7'
export const state = getStateFromStorage(appVersion) || {
  location: location.state,
  appVersion: appVersion,
  data: {},
  loggedIn: false,
  redirect: '',
  user: {
    id: '',
    name: '',
    username: '',
    avatar: '',
    email: ''
  },
  modal: {
    isActive: false,
    content: ''
  },
  auth,
  nav,
  team,
  algobot,
  community
}
