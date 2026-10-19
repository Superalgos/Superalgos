import { defineStore } from 'pinia'
import type { SocialPersonaIdentity } from '@/services/profileService'

interface ProfileState {
  identity: SocialPersonaIdentity | null
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    identity: null,
  }),

  getters: {
    nodeId: (state) => state.identity?.nodeId ?? null,
    nodeCodeName: (state) => state.identity?.nodeCodeName ?? null,
  },

  actions: {
    setProfile(identity: SocialPersonaIdentity) {
      this.identity = identity
    },

    clearProfile() {
      this.identity = null
    },
  },
})
