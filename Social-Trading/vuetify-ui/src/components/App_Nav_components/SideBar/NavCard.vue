<template>
  <v-card variant="flat" class="ft-rail d-flex flex-column h-100">
    <v-list class="ft-rail-list flex-grow-1">
      <v-list-item
        v-for="(item, i) in navItems"
        :key="i"
        :value="item"
        color="primary"
        link
        :to="`/p/${personaId}/${item.path}`"
        class="ft-rail-item"
        :aria-label="item.title"
      >
        <div class="ft-rail-inner">
          <v-icon :icon="item.icon" :size="collapsed ? 26 : 28" />
          <span v-if="!collapsed" class="ft-rail-label">{{ item.title }}</span>
        </div>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list class="ft-rail-list">
      <v-list-item
        color="primary"
        link
        class="ft-rail-item"
        :aria-label="userSettingsItem.title"
      >
        <div class="ft-rail-inner">
          <v-icon :icon="userSettingsItem.icon" :size="collapsed ? 26 : 28" />
          <span v-if="!collapsed" class="ft-rail-label">{{ userSettingsItem.title }}</span>
        </div>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { useNavRail } from '../../../composables/useNavRail'
import { usePersona } from '../../../composables/usePersona'
import { navItems, userSettingsItem } from './navigation'

const { collapsed } = useNavRail()
const { personaId } = usePersona()
</script>

<style scoped>
.ft-rail {
  border: none !important;
  background: transparent;
  position: sticky;
  top: 56px;
}

.ft-rail-list {
  padding: 8px 6px;
  background: transparent;
}

.ft-rail-item {
  min-height: 52px;
  margin-bottom: 4px;
  border-radius: 999px;
  padding-inline: 14px;
}

.ft-rail-item:hover {
  background: var(--ft-hover, #F7F9F9);
}

.ft-rail-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 18px;
  width: 100%;
  justify-content: center;
}

.ft-rail-item:not(.v-list-item--active) .ft-rail-inner {
  justify-content: flex-start;
  padding-left: 8px;
}

.ft-rail-label {
  font-size: 20px;
  line-height: 1.2;
  white-space: nowrap;
  color: var(--ft-text, #0F1419);
  font-weight: 400;
}

.v-list-item--active .ft-rail-label {
  color: var(--ft-blue, #1D9BF0);
  font-weight: 700;
}
</style>
