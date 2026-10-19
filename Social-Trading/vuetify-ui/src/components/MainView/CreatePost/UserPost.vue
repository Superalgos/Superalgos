<template>
  <v-card variant="flat" class="user-post pa-4">
    <div class="d-flex align-start">
      <v-avatar size="42" class="mr-4 mt-1">
        <v-img v-if="selectedSocialPersona?.avatar" :src="selectedSocialPersona.avatar" />
        <v-icon v-else size="28">mdi-account-circle</v-icon>
      </v-avatar>

      <div class="flex-grow-1">
        <v-textarea
          v-model="postText"
          placeholder="What's happening?"
          variant="plain"
          rows="2"
          auto-grow
          class="user-post-input pa-0"
          hide-details
        />

        <div v-if="postImage" class="mt-2">
          <v-img :src="postImage" max-height="300" class="rounded-lg" />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            class="mt-1"
            @click="removeImage"
          />
        </div>

        <div class="d-flex align-center justify-space-between mt-2">
          <div class="d-flex align-center">
            <v-btn icon="mdi-image" size="small" variant="text" @click="openFilePicker" />
            <v-btn icon="mdi-gif" size="small" variant="text" disabled />
            <v-btn icon="mdi-poll" size="small" variant="text" disabled />
            <v-btn icon="mdi-emoticon-happy-outline" size="small" variant="text" disabled />
            <v-btn icon="mdi-calendar" size="small" variant="text" disabled />
            <v-btn icon="mdi-map-marker-outline" size="small" variant="text" disabled />
          </div>

          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            :disabled="!canPost"
            :loading="posting"
            @click="submit"
          >
            Post
          </v-btn>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="handleImage"
        />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Persona } from '@/stores/persona'

/*
 * Port of the old UserPost.vue (MainView/CreatePost): composer card above
 * the feed. Old behavior — avatar from selectedSocialPersona.avatar,
 * "What's happening?" textarea, image pickers (image picker active, others
 * disabled), Post button disabled until text or image present, emits
 * new-post with { postText, postImage, originSocialPersonaId, userName,
 * avatar } consumed by MainPostView's posts/createNewPost dispatch.
 * H: persona entity from the persona store (route-owned selection); userName
 * = persona handle.
 */
const props = defineProps<{ selectedSocialPersona: Persona | null }>()

const emit = defineEmits<{
  (e: 'new-post', payload: {
    postText: string
    postImage: string | null
    originSocialPersonaId: string
    userName: string
    avatar: string
  }): void
}>()

const postText = ref('')
const postImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const posting = ref(false)

const canPost = computed(() => postText.value.trim().length > 0 || postImage.value !== null)

function openFilePicker() {
  fileInput.value?.click()
}

function handleImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    postImage.value = reader.result as string
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function removeImage() {
  postImage.value = null
}

async function submit() {
  if (!canPost.value || !props.selectedSocialPersona) return
  posting.value = true
  try {
    emit('new-post', {
      postText: postText.value.trim(),
      postImage: postImage.value,
      originSocialPersonaId: props.selectedSocialPersona.id,
      userName: props.selectedSocialPersona.handle,
      avatar: props.selectedSocialPersona.avatar,
    })
    postText.value = ''
    postImage.value = null
  } finally {
    posting.value = false
  }
}
</script>
