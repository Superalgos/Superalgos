<template>
  <!-- Drawer mode: brand icon + navigation toggle (layout controls) -->
  <template v-if="navMode === 'drawer'">
    <v-app-bar-nav-icon @click="toggleNavDrawer" />
    <v-icon size="52" class="ml-4">
      <v-img :src="superalgosIcon" />
    </v-icon>
  </template>

  <!-- Rail mode: full wordmark -->
  <v-img v-else :src="superalgosLogo" />

  <v-app-bar-title class="app-title">Social Trading</v-app-bar-title>

  <v-spacer />

  <!-- Entity profile placeholders: Personas and Tbots (right side).
       Not the user's own account settings - those live in the left panel. -->
  <PersonaSelector />
  <BotSelector class="ml-2" />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import superalgosIcon from '@/assets/superalgos.png'
import superalgosLogo from '@/assets/superalgos-logo.png'
import PersonaSelector from './PersonaSelector.vue'
import BotSelector from './BotSelector.vue'

const { navMode, toggleNavDrawer } = inject('appShell', {
  navMode: 'rail',
  toggleNavDrawer: () => {},
})
</script>

<style scoped>
.app-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ft-text, #0F1419);
}
</style>
