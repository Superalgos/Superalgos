import { defineStore } from 'pinia'
import { getProfile, type ProfileEnvelope } from '@/services/profileService'

export interface Persona {
  id: string
  originSocialPersonaId: string
  handle: string
  codeName: string
  bio: string
  avatar: string
  joined: string
}

interface PersonaState {
  byId: Record<string, Persona>
  allIds: string[]
  loading: boolean
  error: string | null
}

let fetchCounter = 0

function normalizePersona(id: string, data: Record<string, unknown>): Persona {
  return {
    id,
    originSocialPersonaId: (data.originSocialPersonaId as string) || id,
    handle: (data.handle as string) || '',
    codeName: (data.codeName as string) || '',
    bio: (data.bio as string) || '',
    avatar: (data.avatar as string) || '',
    joined: (data.joined as string) || '',
  }
}

/* Spread-merge profileData over an existing skeleton (old app.js:70:
   enriched[i] = { ...mapped[i], ...profileResponse.profileData }) —
   defined profileData fields overwrite, missing ones keep skeleton values. */
function mergeProfileData(base: Persona, data: Record<string, unknown>): Persona {
  const merged: Persona = { ...base }
  if (typeof data.originSocialPersonaId === 'string' && data.originSocialPersonaId !== '') {
    merged.originSocialPersonaId = data.originSocialPersonaId
  }
  if (typeof data.handle === 'string' && data.handle !== '') merged.handle = data.handle
  if (typeof data.codeName === 'string' && data.codeName !== '') merged.codeName = data.codeName
  if (typeof data.bio === 'string') merged.bio = data.bio
  if (typeof data.avatar === 'string') merged.avatar = data.avatar
  if (typeof data.joined === 'string' && data.joined !== '') merged.joined = data.joined
  return merged
}

export const usePersonaStore = defineStore('persona', {
  state: (): PersonaState => ({
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  }),

  getters: {
    allPersonas: (state) => state.allIds.map((id) => state.byId[id]),
    allPersonaIds: (state) => state.allIds,
    byIdGetter: (state) => (id: string) => state.byId[id] ?? null,
  },

  actions: {
    setPersonas(personas: Persona[]) {
      this.byId = {}
      this.allIds = []
      for (const persona of personas) {
        this.byId[persona.id] = persona
        this.allIds.push(persona.id)
      }
    },

    mergePersona(persona: Persona) {
      this.byId[persona.id] = persona
      if (!this.allIds.includes(persona.id)) {
        this.allIds.push(persona.id)
      }
    },

    /* Quiet profile load: no loading/error side effects, no race guard.
       Used by the bootstrap enrichment loop. Throws on network failure;
       returns null when the envelope reports an error (profile not in
       storage yet — caller decides whether that is fatal).
       On success, spreads profileData over the existing skeleton (old
       app.js:70 merge semantics) so a partial profile never wipes
       discovery fields. */
    async loadPersonaProfile(id: string): Promise<Persona | null> {
      const envelope: ProfileEnvelope = await getProfile(id)
      if (envelope.result === 'Ok' && envelope.profileData) {
        const existing = this.byId[id]
        if (existing) {
          return mergeProfileData(existing, envelope.profileData)
        }
        return normalizePersona(id, envelope.profileData)
      }
      return null
    },

    /* Route-driven fetch: race-guarded, drives loading/error UI. */
    async fetchPersona(id: string) {
      if (id === 'none') return

      fetchCounter++
      const requestId = fetchCounter

      this.loading = true
      this.error = null

      try {
        const persona = await this.loadPersonaProfile(id)

        if (requestId !== fetchCounter) return

        if (persona) {
          this.mergePersona(persona)
        } else {
          this.error = 'Persona not found'
        }
      } catch (err: unknown) {
        if (requestId !== fetchCounter) return
        this.error = err instanceof Error ? err.message : 'Failed to fetch persona'
      } finally {
        if (requestId === fetchCounter) {
          this.loading = false
        }
      }
    },
  },
})
