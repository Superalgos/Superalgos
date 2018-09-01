/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Route, Switch } from '@hyperapp/router'

import { Callback } from './sections'

export const Auth = ({ match }) => (state, actions) => (
  <div
    class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
    key='auth-box'
    ondestroy={() => actions.auth.clearForms()}
  >
    <Switch>
      <Route path='/callback' render={Callback} />
    </Switch>
  </div>
)

export default Auth
