import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DevelopersView from '../views/DevelopersView.vue'


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
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
