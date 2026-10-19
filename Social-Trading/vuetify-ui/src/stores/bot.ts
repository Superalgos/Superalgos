import { defineStore } from 'pinia'
import { getBotProfile, type BotProfileEnvelope } from '@/services/botsService'

export interface Bot {
  id: string
  handle: string
  codeName: string
  bio: string
  avatar: string
  joined: string
  location: string
}

interface BotState {
  byId: Record<string, Bot>
  allIds: string[]
  selectedBotId: string | null
}

/*
 * Port of the old UI's socialBots Vuex module (socialBots.js), minimal subset:
 * - SET_SOCIAL_BOTS keyed map → byId/allIds (persona-store pattern)
 * - selectedBot + setSelectedBot (old AppBar changeBot)
 * location is hardcoded 'Live on the internet' (old socialBots.js:30).
 */

function normalizeBotProfile(id: string, data: Record<string, unknown>): Partial<Bot> {
  const merged: Partial<Bot> = {}
  /* Old SET_MY_PROFILES (socialBots.js:234-269) destructured
     originSocialTradingBotId off profileData and Object.assign'ed the rest
     onto the bot keyed by that id — same identity here: id stays the
     skeleton's, profileData fields overwrite when present. */
  if (typeof data.handle === 'string' && data.handle !== '') merged.handle = data.handle
  if (typeof data.codeName === 'string' && data.codeName !== '') merged.codeName = data.codeName
  if (typeof data.bio === 'string') merged.bio = data.bio
  if (typeof data.avatar === 'string') merged.avatar = data.avatar
  if (typeof data.joined === 'string' && data.joined !== '') merged.joined = data.joined
  if (typeof data.location === 'string' && data.location !== '') merged.location = data.location
  return merged
}

export const useBotStore = defineStore('bot', {
  state: (): BotState => ({
    byId: {},
    allIds: [],
    selectedBotId: null,
  }),

  getters: {
    allBots: (state) => state.allIds.map((id) => state.byId[id]),
    byIdGetter: (state) => (id: string) => state.byId[id] ?? null,
    selectedBot: (state) =>
      state.selectedBotId ? (state.byId[state.selectedBotId] ?? null) : null,
  },

  actions: {
    setBots(bots: Bot[]) {
      this.byId = {}
      this.allIds = []
      for (const bot of bots) {
        this.byId[bot.id] = bot
        this.allIds.push(bot.id)
      }
      /* Selected bot no longer in list → clear selection */
      if (this.selectedBotId && !this.byId[this.selectedBotId]) {
        this.selectedBotId = null
      }
    },

    /* Quiet profile load: no loading/error side effects. Used by the
       bootstrap enrichment loop (old getMyProfiles, socialBots.js:104-155).
       Throws on network failure; returns null when the envelope reports an
       error or lacks profileData — caller keeps the skeleton. */
    async loadBotProfile(
      id: string,
      originSocialPersonaId: string,
      codeName: string
    ): Promise<Partial<Bot> | null> {
      const envelope: BotProfileEnvelope = await getBotProfile({
        originSocialPersonaId,
        originSocialTradingBotId: id,
        codeName,
      })
      if (envelope.result === 'Ok' && envelope.message === 'Social Entity Profile Found' && envelope.profileData) {
        return normalizeBotProfile(id, envelope.profileData)
      }
      return null
    },

    /* Merge enriched fields into an existing skeleton (old Object.assign
       semantics); no-op if the bot is not in the store. */
    mergeBotProfile(id: string, patch: Partial<Bot>) {
      const bot = this.byId[id]
      if (!bot) return
      this.byId[id] = { ...bot, ...patch }
    },

    setSelectedBot(id: string) {
      if (this.byId[id]) {
        this.selectedBotId = id
      }
    },
  },
})
