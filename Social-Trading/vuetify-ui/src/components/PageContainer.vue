<template>
  <div class="page-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { usePersona } from '@/composables/usePersona'
import { usePersonaStore } from '@/stores/persona'

const { personaId } = usePersona()
const store = usePersonaStore()

watch(
  personaId,
  (newId) => {
    if (newId !== 'none') {
      store.fetchPersona(newId)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.page-container {
  height: 100%;
}
</style>
