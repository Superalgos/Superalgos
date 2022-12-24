import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import DevelopersView from '../views/DevelopersView.vue'
import BitcoinFactoryView from '../views/BitcoinFactoryView.vue'
import SocialTradingView from '../views/SocialTradingView.vue'
import ProfileView from '../views/ProfileView.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/social-trading',
    name: 'Social-Trading',
    component: SocialTradingView
  },
  {
    path: '/Developers',
    name: 'Developers',
    component: DevelopersView
  },
  {
    path: '/BitcoinFactory',
    name: 'BitcoinFactory',
    component: BitcoinFactoryView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
