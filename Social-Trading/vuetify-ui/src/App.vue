<template>
  <v-app>
    <v-main>
      <div class="landing">
        <img
          alt="Superalgos Social Trading branding board"
          class="landing__board"
          src="@/assets/branding-board.png"
        >
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.landing {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.landing__board {
  display: block;
  height: auto;
  max-height: calc(100vh - 48px);
  max-width: 100%;
  object-fit: contain;
  width: auto;
}
</style>
