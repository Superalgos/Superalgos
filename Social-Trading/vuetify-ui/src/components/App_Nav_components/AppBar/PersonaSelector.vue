<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn icon variant="text" v-bind="props" aria-label="Select persona" title="Select persona">
        <v-avatar size="32" color="black">
          <v-img v-if="persona?.avatar" :src="persona.avatar" />
          <v-icon v-else size="24">mdi-account-circle</v-icon>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="300" class="mt-1">
      <v-list color="primary">
        <v-list-item-title class="d-flex justify-center text-h6">
          Select Persona
        </v-list-item-title>

        <v-list-item
          v-for="p in personas"
          :key="p.id"
          :prepend-avatar="p.avatar"
          :title="p.handle"
          :subtitle="p.bio"
          @click="selectPersona(p.id)"
        >
          <template #append>
            <v-icon v-if="p.id === personaId" color="primary">mdi-check</v-icon>
          </template>
        </v-list-item>

        <v-list-item v-if="personas.length === 0">
          <v-list-item-subtitle class="text-center text-medium-emphasis">
            No personas available
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
          New Persona
        </v-btn>
      </v-card>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { usePersona } from '@/composables/usePersona'

const emit = defineEmits(['create-new'])

const { personaId, persona, personas, selectPersona } = usePersona()
</script>
