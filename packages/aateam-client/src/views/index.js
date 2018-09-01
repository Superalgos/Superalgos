/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Route, Switch, Redirect } from '@hyperapp/router'

import { storeStateInStorage } from '../utils/local-storage'

import { Nav } from './nav/header'
import { Footer } from './nav/footer'

import { Landing } from './pages/landing'
import { About } from './pages/about'
import { Docs } from './pages/docs'
import { Auth } from './pages/auth'
import { DashboardWrapper } from './pages/dashboard'
import { AccountWrapper } from './pages/account'
import { AlgobotWrapper } from './pages/algobots'
import { TeamWrapper } from './pages/team'
import { SupportWrapper } from './pages/support'
import { CommunityWrapper } from './pages/community'

export const view = ({ location }) => (state, actions) => {
  if (document.location.pathname !== location.pathname) {
    return <Redirect to={document.location.pathname} />
  }
  return (
    <section onupdate={storeStateInStorage(state)} key='main-container'>
      <Nav />
      <div
        class='container is-marginless is-paddingless is-fluid'
        key='page-container'
      >
        <Switch>
          <Route path='/' render={Landing} />
          <Route path='/about' render={About} />
          <Route parent path='/docs' render={Docs} />
          <Route parent path='/callback' render={Auth} />
          <Route path='/dashboard' render={DashboardWrapper} />
          <Route path='/profile' render={AccountWrapper} />
          <Route path='/settings' render={AccountWrapper} />
          <Route parent path='/algobots' render={AlgobotWrapper} />
          <Route parent path='/team' render={TeamWrapper} />
          <Route parent path='/team/overview' render={TeamWrapper} />
          <Route parent path='/team/settings' render={TeamWrapper} />
          <Route parent path='/support' render={SupportWrapper} />
          <Route path='/teams' render={CommunityWrapper} />
        </Switch>
      </div>
      <Footer />
    </section>
  )
}
