/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { Redirect } from '@hyperapp/router'

import { Intro, Overview } from './sections'
import { auth } from '../../../index'

export const Landing = props => (state, actions) => {
  if (state.redirect === 'dashboard') return <Redirect to='/dashboard' />
  return (
    <div
      class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
      key='landing-box'
      oncreate={() => {
        actions.isLoggedIn(auth.isAuthenticated())
      }}
    >
      <div class='columns is-gapless'>
        <div class='column'>
          <Intro />
          <Overview />
        </div>
      </div>
    </div>
  )
}

export default Landing
