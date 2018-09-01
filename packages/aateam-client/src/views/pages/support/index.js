/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Redirect } from '@hyperapp/router'

import { Sidebar } from '../../nav/sidebar'
import { General } from './sections'

export const SupportWrapper = props => (state, actions) => {
  if (state.user.auth.loggedIn) {
    const name =
      state.user.profile.name === (undefined || null || '')
        ? 'friend'
        : state.user.profile.name
    return (
      <div
        class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
        key='dashboard-box'
        oncreate={() => actions.auth.clearForms()}
      >
        <div class='columns is-gapless'>
          <div class='column is-2 is-blue'>
            <Sidebar />
          </div>
          <div class='column'>
            <General />
          </div>
        </div>
      </div>
    )
  } else {
    return <Redirect to='/login' />
  }
}

export default SupportWrapper
