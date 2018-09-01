/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Route, Switch } from '@hyperapp/router'

import { DocsSidebar, Overview } from './sections'

export const Docs = ({ match }) => (state, actions) => (
  <div class='is-fullheight' key='docs-box'>
    <div class='columns is-gapless'>
      <div class='column is-2 is-blue'>
        <DocsSidebar />
      </div>
      <div class='column is-offset-1 is-10-mobile is-10-tablet is-8-desktop is-7-widescreen is-6-fullhd'>
        <Switch>
          <Route parent path={`${match.path}`} render={Overview} />
        </Switch>
      </div>
    </div>
  </div>
)

export default Docs
