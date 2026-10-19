<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn icon variant="text" v-bind="props" aria-label="Select trading bot" title="Select trading bot">
        <v-avatar size="32" color="black">
          <v-img v-if="selectedBot?.avatar" :src="selectedBot.avatar" />
          <v-icon v-else size="24">mdi-robot</v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="300" class="mt-1">
      <v-list color="primary">
        <v-list-item-title class="d-flex justify-center text-h6">
          Select Trading Bot
        </v-list-item-title>

        <v-list-item
          v-for="b in bots"
          :key="b.id"
          :prepend-avatar="b.avatar"
          :title="b.handle"
          :subtitle="b.bio"
          @click="botStore.setSelectedBot(b.id)"
        >
          <template #append>
            <v-icon v-if="b.id === selectedBot?.id" color="primary">mdi-check</v-icon>
          </template>
        </v-list-item>

        <v-list-item v-if="bots.length === 0">
          <v-list-item-subtitle class="text-center text-medium-emphasis">
            No trading bots available
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2" />

      <v-card color="primary" class="mx-4 mb-2">
        <v-btn
          class="d-flex justify-center text-h6"
          flat
          color="red"
          prepend-icon="mdi-plus"
          @click="emit('create-new')"
        >
          New Trading Bot
        </v-btn>
      </v-card>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBotStore } from '@/stores/bot'

const emit = defineEmits(['create-new'])

const botStore = useBotStore()
const { allBots: bots, selectedBot } = storeToRefs(botStore)
</script>
