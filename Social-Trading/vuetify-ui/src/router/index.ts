import { createRouter, createWebHistory } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'
import PagePlaceholder from '@/components/PagePlaceholder.vue'

const LAST_PERSONA_KEY = 'ft-last-persona-id'

const routes = [
  {
    path: '/',
    redirect: () => {
      const stored = localStorage.getItem(LAST_PERSONA_KEY)
      return stored ? `/p/${stored}/home` : '/p/none/home'
    },
  },
  {
    path: '/p/:personaId',
    component: PageContainer,
    children: [
      {
        path: '',
        redirect: 'home',
      },
      {
        path: 'home',
        name: 'home',
        component: PagePlaceholder,
        meta: { title: 'Home' },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: PagePlaceholder,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'charts',
        name: 'charts',
        component: PagePlaceholder,
        meta: { title: 'Charts' },
      },
      {
        path: 'portfolio',
        name: 'portfolio',
        component: PagePlaceholder,
        meta: { title: 'Portfolio' },
      },
      {
        path: 'users',
        name: 'users',
        component: PagePlaceholder,
        meta: { title: 'Users' },
      },
      {
        path: 'bots',
        name: 'bots',
        component: PagePlaceholder,
        meta: { title: 'T-Bots' },
      },
      {
        path: 'todos',
        name: 'todos',
        component: PagePlaceholder,
        meta: { title: 'Exchange' },
      },
      {
        path: 'networks',
        name: 'networks',
        component: PagePlaceholder,
        meta: { title: 'Networks' },
      },
      {
        path: 'followers',
        name: 'followers',
        component: PagePlaceholder,
        meta: { title: 'Follow' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const personaId = to.params.personaId
  if (typeof personaId === 'string' && personaId !== 'none') {
    localStorage.setItem(LAST_PERSONA_KEY, personaId)
  }
})

export default router
