import { defineStore } from 'pinia'
import { getTimelineFeed, createPost, type RawTimelineEvent } from '@/services/postService'
import { usePersonaStore } from './persona'

export interface Post {
  originPostHash: string
  originSocialPersonaId: string
  postText: string
  postImage: string | null
  userName: string
  avatar: string
  eventType: number | undefined
  postType: number | null
  timestamp: number | undefined
  targetPostHash: string | null
  targetSocialPersonaId: string | null
  originPost: {
    repliesCount: number
    reactions: unknown[][]
    reaction: number | undefined
  }
  fileKeys: unknown
  eventId: string | null
}

interface PostState {
  byId: Record<string, Post>
  allIds: string[]
  byPersonaId: Record<string, string[]>
  byTargetPostId: Record<string, string[]>
  byEventType: Record<number, string[]>
  loading: boolean
  lastFetchPersonaId: string | null
}

/*
 * Port of the old UI's posts Vuex module (posts.js), minimal subset for the
 * bootstrap posts loop: canonical post records normalized by originPostHash,
 * the persona/reply/eventType indexes, and fetchPersonaPosts. Write actions
 * (create/reaction/repost/reply/remove) and the profile slice stay out until
 * their UI increments — same boundary discipline as the persona/bot stores.
 */

/*
 * The single transformation boundary (old posts.js:1006-1043) — raw API
 * events never enter the store directly. ?? preserves type 0 / reaction 0.
 */
function normalizePost(rawPost: RawTimelineEvent): Post {
  return {
    originPostHash: rawPost.originPostHash || '',
    originSocialPersonaId: rawPost.originSocialPersonaId || '',
    postText: rawPost.postText || '',
    postImage: rawPost.postImage || null,
    userName: rawPost.userName || '',
    avatar: rawPost.avatar || '',
    eventType: rawPost.eventType,
    postType: rawPost.postType ?? null,
    timestamp: rawPost.timestamp,
    targetPostHash: rawPost.targetPostHash || null,
    targetSocialPersonaId: rawPost.targetSocialPersonaId || null,
    originPost: {
      repliesCount: rawPost.originPost?.repliesCount ?? rawPost.repliesCount ?? 0,
      reactions: rawPost.originPost?.reactions ?? rawPost.reactions ?? [],
      reaction: rawPost.originPost?.reaction ?? rawPost.reaction,
    },
    fileKeys: rawPost.fileKeys || null,
    eventId: rawPost.eventId || null,
  }
}

export const usePostStore = defineStore('post', {
  state: (): PostState => ({
    byId: {},
    allIds: [],
    byPersonaId: {},
    byTargetPostId: {},
    byEventType: {},
    loading: false,
    lastFetchPersonaId: null,
  }),

  getters: {
    postsByPersona: (state) => (personaId: string) => {
      const hashes = state.byPersonaId[personaId] || []
      return hashes
        .map((h) => state.byId[h])
        .filter(Boolean)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    },
    allPosts: (state) => {
      return state.allIds
        .map((h) => state.byId[h])
        .filter(Boolean)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    },
  },

  actions: {
    /* Normalize and upsert posts into the canonical indexes (old
       SET_POSTS, posts.js:146-193). Replies land in the same byId with
       byTargetPostId indexing; eventType indexes classification. */
    setPosts(personaId: string, posts: RawTimelineEvent[]) {
      for (const raw of posts) {
        const canonical = normalizePost(raw)
        const hash = canonical.originPostHash
        if (!hash) continue

        this.byId[hash] = canonical
        if (!this.allIds.includes(hash)) {
          this.allIds.push(hash)
        }
        const personaHashes = this.byPersonaId[personaId] || []
        if (!personaHashes.includes(hash)) {
          this.byPersonaId[personaId] = [...personaHashes, hash]
        }
        if (canonical.targetPostHash) {
          const targetHashes = this.byTargetPostId[canonical.targetPostHash] || []
          if (!targetHashes.includes(hash)) {
            this.byTargetPostId[canonical.targetPostHash] = [...targetHashes, hash]
          }
        }
        if (canonical.eventType !== undefined) {
          const typeHashes = this.byEventType[canonical.eventType] || []
          if (!typeHashes.includes(hash)) {
            this.byEventType[canonical.eventType] = [...typeHashes, hash]
          }
        }
      }
    },

    /* Port of the old posts/fetchPersonaPosts action (posts.js:608-676):
       timeline fetch → avatar enrichment from the persona store (the
       timeline API does not return avatars on events; old code read
       rootState.personaIdentity + legacy personas — here the persona
       store is the single identity source) → eventType classification
       (10/20 posts, 11/21 replies, 12/22 reposts-as-posts; skip if
       originPost missing; other types ignored) → setPosts. Errors are
       swallowed internally (old action's catch never rethrown — the
       bootstrap loop's await never fails on a persona). */
    async fetchPersonaPosts(personaId: string) {
      this.loading = true
      this.lastFetchPersonaId = personaId

      try {
        const envelope = await getTimelineFeed(personaId)
        const timelineResponse = envelope.data

        if (!Array.isArray(timelineResponse) || timelineResponse.length === 0) {
          return
        }

        const personaStore = usePersonaStore()
        for (const event of timelineResponse) {
          if (!event.avatar && event.originSocialPersonaId) {
            event.avatar = personaStore.byId[event.originSocialPersonaId]?.avatar || ''
          }
        }

        const postEvents: RawTimelineEvent[] = []
        const replyEvents: RawTimelineEvent[] = []

        for (const event of timelineResponse) {
          if (event.eventType === 10 || event.eventType === 20) {
            if (event.originPost) postEvents.push(event)
          } else if (event.eventType === 11 || event.eventType === 21) {
            if (event.originPost) replyEvents.push(event)
          } else if (event.eventType === 12 || event.eventType === 22) {
            if (event.originPost) postEvents.push(event)
          }
          /* Other event types (14 delete, 15 follow, 700+ reactions) ignored —
             old posts.js:658 */
        }

        if (postEvents.length > 0) {
          this.setPosts(personaId, postEvents)
        }
        if (replyEvents.length > 0) {
          this.setPosts(personaId, replyEvents)
        }
      } catch (error) {
        console.error('fetchPersonaPosts error:', error)
      } finally {
        this.loading = false
      }
    },

    /* Port of the old posts/createNewPost action (posts.js): POST /posts
       with the composer payload, brief wait for backend processing, then
       refetch the persona timeline to pick up the canonical record (the
       create response does not include it). Old code waited a hard 1000ms
       then dispatched fetchPersonaPosts; same contract here. */
    async createNewPost(payload: {
      personaId: string
      postText: string
      postImage: string | null
      userName: string
      avatar: string
    }) {
      const body = {
        postText: payload.postText,
        postImage: payload.postImage,
        originSocialPersonaId: payload.personaId,
        userName: payload.userName,
        avatar: payload.avatar,
      }
      const response = await createPost(body)
      if (response && response.result === 'Ok') {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await this.fetchPersonaPosts(payload.personaId)
      }
      return response
    },
  },
})
