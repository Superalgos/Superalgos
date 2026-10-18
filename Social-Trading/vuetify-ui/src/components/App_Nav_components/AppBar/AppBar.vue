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
  <v-btn icon variant="text" aria-label="Persona profile" title="Persona profile">
    <v-icon>mdi-account-circle</v-icon>
  </v-btn>
  <v-btn icon variant="text" class="ml-2" aria-label="Tbot profile" title="Tbot profile">
    <v-icon>mdi-robot</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import superalgosIcon from '@/assets/superalgos.png'
import superalgosLogo from '@/assets/superalgos-logo.png'

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
