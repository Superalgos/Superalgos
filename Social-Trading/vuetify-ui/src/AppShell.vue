<template>
  <v-app>
    <v-app-bar color="white" flat height="56" class="ft-app-bar">
      <slot name="app-bar" />
    </v-app-bar>

    <!-- v-main wraps the whole shell so the app bar/footer registered layout
         padding (top/bottom/left/right) covers every region uniformly.
         Centered application container: max-width + outer breathing room on
         wide screens. Chrome (app bar, footer) stays full-width outside it. -->
    <v-main>
      <div class="ft-shell">
        <!-- Layout row: nav | feed | right panel. Widths are flex-driven below. -->
        <v-row no-gutters>
          <!-- 1. Navigation: drawer below md, rail at md+ -->
          <template v-if="navMode === 'drawer'">
            <SideBar v-model:open="navDrawerOpen" />
          </template>

          <v-col
            v-else
            :class="collapsed ? 'side-rail side-rail--collapsed' : 'side-rail'"
          >
            <SideBar />
          </v-col>

          <!-- 2. Main feed: grows with available space (no fixed cap) -->
          <v-col class="main-content">
            <div class="main-surface">
              <slot name="main" />
            </div>
          </v-col>

          <!-- 3. Right panel: permanent column at lg+ only -->
          <v-col v-if="showRightPanelInline" class="right-col">
            <div class="ft-panel-scale">
              <slot name="right-panel" />
            </div>
          </v-col>
        </v-row>
      </div>
    </v-main>

    <!-- 4. Right panel handle: below lg only; opens the overlay -->
    <div
      v-if="!showRightPanelInline"
      class="right-sidebar-handle"
      @click="rightDrawerOpen = !rightDrawerOpen"
    >
      <v-icon size="14" color="white">
        {{ rightDrawerOpen ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
      </v-icon>
    </div>

    <!-- 5. Right panel overlay: temporary, never squeezes the feed -->
    <v-navigation-drawer
      v-if="!showRightPanelInline"
      v-model="rightDrawerOpen"
      location="right"
      temporary
    >
      <div class="ft-panel-scale">
        <slot name="right-panel" />
      </div>
    </v-navigation-drawer>

    <Footer />
  </v-app>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import SideBar from './components/App_Nav_components/SideBar/SideBarCol.vue'
import Footer from './components/App_Nav_components/Footer/Footer.vue'
import { useNavRail } from './composables/useNavRail'

const { smAndDown, lgAndUp } = useDisplay()
const { collapsed } = useNavRail()

const navMode = computed(() => (smAndDown.value ? 'drawer' : 'rail'))
const showRightPanelInline = computed(() => lgAndUp.value)

const navDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleNavDrawer() {
  navDrawerOpen.value = !navDrawerOpen.value
}

provide('appShell', { navMode, toggleNavDrawer })

watch(navMode, (mode) => {
  if (mode !== 'drawer') {
    navDrawerOpen.value = false
  }
})

watch(showRightPanelInline, (inline) => {
  if (inline) {
    rightDrawerOpen.value = false
  }
})
</script>

<style scoped>
/* Centered application container: one alignment rule for the whole shell.
   Chrome (app bar, footer) stays full-width outside it; outer space on
   wide viewports is intentional breathing room, not empty columns.
   Max-width widens at xl so scaled visuals have room to breathe. */
.ft-shell {
  width: 100%;
  max-width: var(--ft-shell-max);
  margin-inline: auto;
}

/* 2. Main feed: grows with available space; single merged rule.
    flex-basis 0 (not width:100%) so the right column stays on the same row.
    max-width caps feed at a readable width (lg+); slack in the row flows
    past the right column so the panel keeps its natural gutter to the feed. */
.main-content {
  flex: 1 1 0;
  min-width: 0;
  max-width: var(--ft-feed-max);
  padding: 12px var(--ft-feed-pad);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Visual scale: zoom the feed CONTENT (not the column box) so px-sized
   feature typography/spacing/effort grows with tier without feature files
   knowing about breakpoints. Auto-width blocks reflow at the scaled density. */
.main-content .main-surface {
  zoom: var(--ft-scale-feed);
}

/* 1. Navigation rail: fixed footprint, two states (wider at xl) */
.side-rail {
  flex: 0 0 var(--ft-rail-expanded);
  max-width: var(--ft-rail-expanded);
  min-width: var(--ft-rail-expanded);
  padding: 12px;
}

.side-rail--collapsed {
  flex: 0 0 var(--ft-rail-collapsed);
  max-width: var(--ft-rail-collapsed);
  min-width: var(--ft-rail-collapsed);
}

/* Nav content scales slightly below feed rate (hierarchy: icons/labels
   expressive, body text primary) — rail box width stays token-driven. */
.side-rail :deep(.ft-rail) {
  zoom: var(--ft-scale-nav);
}

/* Icon emphasis (nav + panel only, not global): +7% nested zoom multiplies
   with the region scale. MDI glyphs have no semibold cut — size is the
   weight mechanism; outline->filled swaps live in SideBarCol icon data. */
.side-rail :deep(.v-icon) {
  zoom: 1.07;
}

.ft-panel-scale :deep(.v-icon) {
  zoom: 1.07;
}

/* Avatar emphasis in the right panel (icons+avatars share the +7% rate) */
.ft-panel-scale :deep(.v-avatar) {
  zoom: 1.07;
}

/* 3. Right panel column: fixed footprint at lg+ only (wider at xl) */
.right-col {
  flex: 0 0 var(--ft-aside-w);
  max-width: var(--ft-aside-w);
  min-width: var(--ft-aside-w);
  margin-left: var(--ft-shell-gap);
  padding: 12px;
}

/* Panel content scale wrapper (inline column + overlay drawer share it) */
.ft-panel-scale {
  zoom: var(--ft-scale-panel);
}

/* 4. Overlay handle: slim edge tab shown below lg */
.right-sidebar-handle {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 64px;
  background: var(--ft-blue);
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  box-shadow: -1px 1px 4px rgba(0, 0, 0, 0.15);
}
</style>

<style>
:root {
  --ft-blue: #1D9BF0;
  --ft-text: #0F1419;
  --ft-muted: #536471;
  --ft-border: #EFF3F4;
  --ft-hover: #F7F9F9;
  --ft-surface: #FFFFFF;
  --ft-error: #F4212E;
  --ft-success: #00BA7C;
  --ft-radius: 16px;

  /* Region geometry (base tier: mobile / below lg) */
  --ft-shell-max: 1400px;
  --ft-rail-expanded: 275px;
  --ft-rail-collapsed: 88px;
  --ft-aside-w: 320px;
  --ft-shell-gap: 24px;
  --ft-feed-pad: 20px;
  --ft-feed-max: 100%;

  /* Visual scale rates (deliberate hierarchy: feed text primary,
     nav/panel secondary; spacing inside zoomed regions follows along) */
  --ft-scale-feed: 1;
  --ft-scale-nav: 1;
  --ft-scale-panel: 1;
}

/* Tablet / mid (md+): subtle first step so scale progression is gradual
   (mobile 1.0 -> md 1.03 -> lg 1.06 -> xl 1.14). Widths unchanged. */
@media (min-width: 960px) {
  :root {
    --ft-scale-feed: 1.03;
    --ft-scale-nav: 1.02;
    --ft-scale-panel: 1.02;
  }
}

/* Desktop (lg+): larger typography/icons with the richer layout;
   widths unchanged — scale first, geometry widens at xl. */
@media (min-width: 1260px) {
  :root {
    --ft-scale-feed: 1.06;
    --ft-scale-nav: 1.04;
    --ft-scale-panel: 1.04;
    /* Readable feed cap (C37 trading-content value); effective density
       ~641px (680/1.06) — xl cap keeps that density (~720/1.14 ≈ 631). */
    --ft-feed-max: 680px;
  }
}

/* Large monitors (xl+): gradual further increase; container and fixed
   regions widen so the larger visual elements have room to breathe.
   Content-fit derived: 1520 = 320 rail + 28 gap + 842 feed + 330 panel. */
@media (min-width: 1920px) {
  :root {
    --ft-shell-max: 1566px;
    --ft-rail-expanded: 320px;
    --ft-rail-collapsed: 96px;
    --ft-aside-w: 350px;
    --ft-shell-gap: 28px;
    --ft-feed-pad: 24px;
    --ft-feed-max: 720px;
    --ft-scale-feed: 1.14;
    --ft-scale-nav: 1.08;
    --ft-scale-panel: 1.10;
  }
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: var(--ft-text);
}

.ft-app-bar {
  border-bottom: 1px solid var(--ft-border, #EFF3F4);
}
</style>
