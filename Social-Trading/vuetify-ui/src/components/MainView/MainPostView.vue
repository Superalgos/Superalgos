<template>
  <div class="main-post-view">
    <v-tabs v-model="tab" align-tabs="title" color="primary" class="ft-tabs mt-0">
      <v-tab v-for="(item, index) in items" :key="index" :value="index" class="ft-tab">
        {{ item }}
      </v-tab>
    </v-tabs>

    <UserPost
      v-if="persona"
      :selected-social-persona="persona"
      @new-post="handleNewPost"
    />

    <div
      v-if="!bootstrapped"
      class="ft-feed-loading d-flex flex-column align-center justify-center py-8"
    >
      <v-progress-circular indeterminate color="primary" size="40" />
      <span class="text-body-2 text-medium-emphasis mt-3">Loading feed…</span>
    </div>

    <v-window v-else v-model="tab" class="ft-content-window">
      <v-window-item v-for="(item, index) in items" :key="index" :value="index">
        <ForYou v-if="index === 0" :selected-social-persona-id="personaId" />
        <Following v-if="index === 1" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePersona } from '@/composables/usePersona'
import { usePostStore } from '@/stores/post'
import { useBootstrap } from '@/composables/useBootstrap'
import UserPost from './CreatePost/UserPost.vue'
import ForYou from './Tabs/ForYou.vue'
import Following from './Tabs/Following.vue'

/*
 * Port of the old MainPostView.vue: v-tabs ['For', 'Following'], UserPost
 * composer above the window, spinner while !app/bootstrapped, v-window
 * index 0 = ForYou, index 1 = Following. Old tab ref starts null (no tab
 * selected until the user clicks one) — reproduced faithfully. new-post
 * event → posts/createNewPost (posts.js createNewPost: POST /posts, brief
 * wait, refetch timeline).
 */
const items = ['For', 'Following']
const tab = ref<number | null>(null)

const { personaId, persona } = usePersona()
const { bootstrapState } = useBootstrap()
const bootstrapped = bootstrapState.bootstrapped
const postStore = usePostStore()

function handleNewPost(newPost: {
  postText: string
  postImage: string | null
  originSocialPersonaId: string
  userName: string
  avatar: string
}) {
  postStore.createNewPost({
    personaId: newPost.originSocialPersonaId,
    postText: newPost.postText,
    postImage: newPost.postImage,
    userName: newPost.userName,
    avatar: newPost.avatar,
  })
}
</script>

<style scoped>
.ft-tabs {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.ft-content-window {
  min-height: 200px;
}
</style>
