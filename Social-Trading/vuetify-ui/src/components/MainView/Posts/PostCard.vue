<template>
  <v-card variant="flat" class="mt-3 post-card">
    <v-row no-gutters class="align-center px-4 py-3">
      <v-col cols="auto" class="mr-4">
        <v-avatar size="42">
          <v-img v-if="post.avatar" :src="post.avatar" />
          <v-icon v-else size="28">mdi-account-circle</v-icon>
        </v-avatar>
      </v-col>
      <v-col class="pa-0">
        <div class="d-flex align-center text-subtitle-1">
          <span class="ft-post-author">{{ post.userName }}</span>
          <span class="middot mx-1">&middot;</span>
          <span class="timestamp ft-post-timestamp">
            {{ formatDate(post.timestamp) }}
          </span>
        </div>
      </v-col>
    </v-row>

    <v-card-text class="pt-0">
      <p class="ft-post-text text-body-2">{{ post.postText }}</p>
      <v-img
        v-if="post.postImage"
        :src="post.postImage"
        class="mt-2 rounded-lg"
        max-height="500"
        cover
      />
      <div v-if="reactionCount > 0" class="d-flex align-center mt-1">
        <v-icon color="primary" size="18">mdi-heart</v-icon>
        <span class="text-body-2 ml-1">{{ reactionCount }}</span>
      </div>
    </v-card-text>

    <v-card-actions class="px-4 pb-3">
      <div class="ft-action-bar d-flex align-center justify-space-between w-100">
        <div
          v-for="item in icons"
          :key="item.icon"
          class="d-flex align-center ft-action-item"
        >
          <v-icon color="primary" size="22">{{ item.icon }}</v-icon>
          <span class="text-body-2 ml-1">{{ item.value }}</span>
        </div>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/stores/post'
import { formatDate } from '@/utils/formatDate'

/*
 * Presentational port of the old Post.vue card (PostHeader + PostContent +
 * PostActionBar). Interaction wiring is deliberately absent: the old card's
 * reply/repost/reaction/share handlers dispatch posts-store write actions
 * (addReplysToPostInStorage / addRepost / addReaction / removeReaction /
 * addView) that are not ported yet, and the Follow chip + menu depend on the
 * personas follow-relationship model (followRelationships / SocialService
 * followUser) which has no H: counterpart. Icons and counts match the old
 * card's visual state; clicks are inert until those increments land.
 */
const props = defineProps<{ post: Post }>()

const reactionCount = computed(() => {
  const pairs = props.post?.originPost?.reactions
  if (!Array.isArray(pairs)) return 0
  const pair = pairs.find((entry) => Array.isArray(entry) && entry[0] === 1)
  return pair ? (pair[1] as number) : 0
})

const icons = computed(() => [
  { icon: 'mdi-message-reply-outline', value: props.post?.originPost?.repliesCount || 0 },
  { icon: 'mdi-share-variant', value: 0 },
  {
    icon: reactionCount.value > 0 && props.post?.originPost?.reaction === 1 ? 'mdi-heart' : 'mdi-heart-outline',
    value: reactionCount.value,
  },
  { icon: 'mdi-poll', value: 0 },
  { icon: 'mdi-cloud-download-outline', value: 0 },
])
</script>

<style scoped>
.ft-post-author {
  font-weight: 600;
}

.ft-post-timestamp {
  font-weight: bold;
  font-size: 12px;
}

.ft-post-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.ft-action-item {
  min-width: 0;
}

.at-symbol,
.middot,
.timestamp {
  font-weight: lighter;
}
</style>
