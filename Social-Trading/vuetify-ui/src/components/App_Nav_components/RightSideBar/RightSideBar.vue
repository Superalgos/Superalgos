<template>
  <v-card variant="flat" class="ft-right-panel">
    <v-card-title class="ft-panel-title">Right panel</v-card-title>
    <v-card-text class="text-medium-emphasis">
      Contextual information and secondary tools placeholder.
    </v-card-text>
  </v-card>
</template>

<style scoped>
.ft-right-panel {
  border: none !important;
  background: transparent;
  position: sticky;
  top: 56px;
}

.ft-right-panel :deep(.v-card) {
  border: none !important;
}

.ft-panel-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ft-text, #0F1419);
}
</style>
