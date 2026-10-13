import { createRouter, createWebHistory } from 'vue-router'

import SocialTradingView from '../views/SocialTradingView.vue'



const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainAppView,
    meta: { hasExtraColumns: true, useDrawerOnMobile: true}
  },
  {
    path: '/Charts',
    name: 'charts',
    component: ChartsView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },
  {
    path: '/Dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },{
    path: '/Followers',
    name: 'followers',
    component: FollowersView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: PortfolioView,
    meta: { hasExtraColumns: true, useDrawerOnMobile: true}
  },
  
  {
    path: '/Networks',
    name: 'networks',
    component: NetworksView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },
  {
    path: '/Bots',
    name: 'bots',
    component: BotsView
  },
  {
    path: '/Users',
    name: 'users',
    component: UsersView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },
  {
    path: '/Todos',
    name: 'todos',
    component: TodosView,
    meta: { hasExtraColumns: false, useDrawerOnMobile: true}
  },
  {
    path: '/vs-1',
    name: 'version-1',
    component: SocialTradingView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
