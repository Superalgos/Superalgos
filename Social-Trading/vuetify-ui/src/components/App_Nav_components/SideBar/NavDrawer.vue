<template>
  <v-navigation-drawer
    :model-value="open"
    @update:model-value="$emit('update:open', $event)"
    temporary
  >
    <v-list>
      <v-list-item
        v-for="(item, i) in navItems"
        :key="i"
        :value="item"
        color="primary"
        rounded="shaped"
        link
        :to="item.to"
        class="ft-drawer-item"
        :aria-label="item.title"
        :prepend-icon="item.icon"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <v-list>
        <v-list-item
          color="primary"
          rounded="shaped"
          link
          class="ft-drawer-item"
          :aria-label="userSettingsItem.title"
          :prepend-icon="userSettingsItem.icon"
        >
          <v-list-item-title>{{ userSettingsItem.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { navItems, userSettingsItem } from './navigation'

defineProps({
  open: Boolean,
})

defineEmits(['update:open'])
</script>

<style scoped>
.ft-drawer-item {
  min-height: 56px;
}
</style>
