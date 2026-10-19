<template>
  <div class="for-you">
    <PostCard v-for="post in loadedPosts" :key="post.originPostHash" :post="post" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePostStore } from '@/stores/post'
import PostCard from '../Posts/PostCard.vue'

/*
 * Port of the old ForYou.vue (MainView/Tabs): renders the timeline for the
 * route persona. Old source: posts store getter postsByPersona(selectedUser
 * .originSocialPersonaId) (posts.js:58-66, feed hydrated at bootstrap by
 * getSocialEntityList → fetchTimelinePosts chain). H: equivalent — posts
 * store byPersonaId index, hydrated by the useBootstrap posts loop / manual
 * fetchPersonaPosts. Blank when empty (old behavior — no empty-state card).
 */
const props = defineProps<{ selectedSocialPersonaId: string }>()

const postStore = usePostStore()
const loadedPosts = computed(() => postStore.postsByPersona(props.selectedSocialPersonaId))
</script>
