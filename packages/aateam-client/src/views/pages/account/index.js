/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Switch, Route, Redirect } from '@hyperapp/router'

import { Sidebar } from '../../nav/sidebar'
import { Profile, Settings } from './sections'

export const AccountWrapper = props => (state, actions) => {
  if (state.loggedIn) {
    const name =
      state.user.username === (undefined || null || '')
        ? 'friend'
        : state.user.username
    return (
      <div
        class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
        key='account-box'
        oncreate={() => actions.auth.clearForms()}
      >
        <div class='columns is-gapless'>
          <div class='column is-2 is-blue'>
            <Sidebar />
          </div>
          <div class='column is-light'>
            <Switch>
              <Route path='/profile' render={Profile} />
              <Route path='/settings' render={Settings} />
            </Switch>
          </div>
        </div>
      </div>
    )
  } else {
    return <Redirect to='/login' />
  }
}

export default AccountWrapper
