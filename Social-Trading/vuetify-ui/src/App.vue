<template>
  <AppShell>
    <template #app-bar>
      <AppBar />
    </template>

    <template #main>
      <router-view />
    </template>

    <template #right-panel>
      <RightSideBar />
    </template>
  </AppShell>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from './AppShell.vue'
import AppBar from './components/App_Nav_components/AppBar/AppBar.vue'
import RightSideBar from './components/App_Nav_components/RightSideBar/RightSideBar.vue'
import { useBootstrap } from './composables/useBootstrap'
import { usePersona } from './composables/usePersona'

const route = useRoute()
const router = useRouter()
const { bootstrap, bootstrapState } = useBootstrap()
const { resolveInitialPersonaId } = usePersona()

bootstrap()

/*
 * After bootstrap populates the store, move off the 'none' sentinel to the
 * restored selection (localStorage match or first persona), preserving the
 * current page. Route remains the selection authority afterwards.
 */
watch(bootstrapState.bootstrapped, (bootstrapped) => {
  if (!bootstrapped) return
  const current = route.params.personaId
  if (typeof current === 'string' && current !== 'none') return

  const resolved = resolveInitialPersonaId()
  if (!resolved) return

  const segments = route.path.split('/').filter(Boolean)
  const page = segments[segments.length - 1] ?? 'home'
  router.replace(`/p/${resolved}/${page}`)
})
</script>
