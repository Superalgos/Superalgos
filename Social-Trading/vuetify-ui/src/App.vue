<template>
  <AppShell>
    <template #app-bar>
      <AppBar />
    </template>

    <template #main>
      <div class="ft-workspace">
        <v-card variant="flat" class="ft-workspace__card">
          <v-card-text class="text-medium-emphasis">
            Main workspace
          </v-card-text>
        </v-card>
      </div>
    </template>

    <template #right-panel>
      <RightSideBar />
    </template>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from './AppShell.vue'
import AppBar from './components/App_Nav_components/AppBar/AppBar.vue'
import RightSideBar from './components/App_Nav_components/RightSideBar/RightSideBar.vue'
</script>

<style scoped>
.ft-workspace {
  padding-top: 4px;
}

.ft-workspace__card {
  min-height: 320px;
}
</style>
