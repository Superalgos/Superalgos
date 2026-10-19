<template>
  <div class="following-tab">
    <v-card variant="flat" class="pa-6 text-medium-emphasis">
      <p class="text-body-1">No Following</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
/*
 * HONEST PORT — the old Following tab is NOT a real feed. Evidence:
 * - MainPostView.vue (E: Vue-UI) hardcodes window index 1 to a static
 *   v-card "No Following".
 * - The dedicated Tabs/Following.vue component exists in E: but is EMPTY
 *   (no template, no importers — dead code).
 * The old app DOES maintain follow relationships (personas store
 * followRelationships keyed [origin][target], hydrated from GET
 * /social/following, follow/unfollow via POST /social/follow eventType
 * 15/16 — useFollowRelationship composable), but nothing ever renders a
 * Following feed from them. Following content in E: appears only on entity
 * profile pages, never here.
 * This tab reproduces the actual reference behavior. A real Following feed
 * (timeline of followed personas via the existing GET /posts/feed contract)
 * is a future increment — not invented here.
 */
</script>
