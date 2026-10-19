<template>
  <div class="page-placeholder">
    <v-card variant="flat" class="pa-6">
      <h2 class="text-h5 mb-4">{{ pageTitle }}</h2>

      <!-- Loading -->
      <div v-if="loading" class="d-flex align-center gap-2">
        <v-progress-circular indeterminate size="24" width="2" />
        <span class="text-medium-emphasis">Loading persona…</span>
      </div>

      <!-- Error -->
      <v-alert
        v-else-if="error"
        type="warning"
        variant="tonal"
        class="mb-2"
        max-width="480"
      >
        {{ error }}
      </v-alert>

      <!-- Resolved persona -->
      <div v-else-if="persona">
        <div class="d-flex align-center gap-3 mb-3">
          <v-avatar size="48" color="black">
            <v-img v-if="persona.avatar" :src="persona.avatar" />
            <v-icon v-else size="28">mdi-account-circle</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6">{{ persona.handle || persona.id }}</div>
            <div v-if="persona.codeName" class="text-medium-emphasis">@{{ persona.codeName }}</div>
          </div>
        </div>
        <p v-if="persona.bio" class="text-body-1 mb-1">{{ persona.bio }}</p>
        <p v-if="persona.joined" class="text-caption text-medium-emphasis">Joined {{ persona.joined }}</p>
        <p class="text-caption text-medium-emphasis mt-3">ID: {{ personaId }}</p>
      </div>

      <!-- Empty / no persona -->
      <p v-else class="text-medium-emphasis">
        {{ personaId === 'none' ? 'No persona selected.' : 'Persona not found in store.' }}
      </p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePersona } from '@/composables/usePersona'

const { personaId, persona, loading, error } = usePersona()

const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) ?? 'Page')
</script>

<style scoped>
.page-placeholder {
  padding-top: 4px;
}
</style>
