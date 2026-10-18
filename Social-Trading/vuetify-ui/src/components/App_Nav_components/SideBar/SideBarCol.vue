<template>
  <NavDrawer
    v-if="navMode === 'drawer'"
    :open="open"
    @update:open="$emit('update:open', $event)"
  />
  <NavCard v-else />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import NavDrawer from './NavDrawer.vue'
import NavCard from './NavCard.vue'

defineProps({
  open: Boolean,
})

defineEmits(['update:open'])

const { navMode } = inject('appShell', { navMode: 'rail' })
</script>
