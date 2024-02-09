import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DevelopersView from '../views/DevelopersView.vue'
import BitcoinFactoryView from '../views/BitcoinFactoryView.vue'
import GovernanceView from '../views/GovernanceView.vue'
import AlgoTradingView from '../views/AlgoTradingView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
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
    path: '/Governance',
    name: 'Governance',
    component: GovernanceView
  },
  {
    path: '/AlgoTrading',
    name: 'AlgoTrading',
    component: AlgoTradingView
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
