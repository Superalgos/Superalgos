import { reactive, toRefs } from 'vue'
import {
  getSocialPersona,
  getSocialEntityList,
} from '@/services/profileService'
import { getBotEntityList } from '@/services/botsService'
import { useProfileStore } from '@/stores/profile'
import { usePersonaStore, type Persona } from '@/stores/persona'
import { useBotStore, type Bot } from '@/stores/bot'

/*
 * useBootstrap — app-start orchestration (adapted from the old UI's
 * app/bootstrap Vuex action, split per our rules: services do HTTP,
 * stores own data, this composable orchestrates).
 *
 * Sequence (old behavior preserved):
 * 1. getSocialPersona  → node identity (or null → clear profile)
 * 2. getSocialEntityList → persona list (id, codeName, handle only)
 * 3. map to skeletons → setPersonas (selector has data immediately)
 * 4. serial getProfile enrichment per persona; failures skip enrichment
 *    (persona stays as skeleton — old app.js:73-75 swallow semantics)
 * 5. getBotEntityList → bots (old app.js:114 dispatch socialBots/fetchSocialBots;
 *    failure swallowed internally — old fetchSocialBots try/catch never
 *    failed bootstrap)
 * 6. map to bot skeletons → setBots (selector has data immediately)
 * 7. bot profile enrichment in background (old app.js:114 dispatched
 *    fetchSocialBots WITHOUT await; old getMyProfiles socialBots.js:104-155
 *    loops bots × personas until first 'Social Entity Profile Found').
 *    Not awaited so profile requests never delay bootstrapped/redirect —
 *    selectors stay usable, fields update reactively as merges land.
 *
 * Module-level state: single bootstrap per app lifetime (same pattern
 * as useNavRail's module-level storage).
 */
const state = reactive({
  bootstrapped: false,
  bootstrapping: false,
  error: null as string | null,
})

export function useBootstrap() {
  const profileStore = useProfileStore()
  const personaStore = usePersonaStore()
  const botStore = useBotStore()

  /*
   * Old getMyProfiles (socialBots.js:104-155): for each bot, try each
   * persona as originSocialPersonaId until one returns the profile —
   * the bot's profile file lives under its owning persona's storage and
   * the UI does not know which persona owns it. Envelope errors and
   * network failures both skip to the next persona; a bot with no
   * successful attempt keeps its skeleton (old SET_MY_PROFILES_ERROR
   * only annotated profileMessage — no entity removal).
   */
  async function enrichBotProfiles(bots: Bot[]) {
    const personaIds = personaStore.allPersonaIds

    for (const bot of bots) {
      for (const personaId of personaIds) {
        try {
          const patch = await botStore.loadBotProfile(bot.id, personaId, bot.codeName)
          if (patch) {
            botStore.mergeBotProfile(bot.id, patch)
            break /* profile found under this persona — next bot */
          }
        } catch {
          /* timeout/network — next persona, skeleton kept */
        }
      }
    }
  }

  async function bootstrap() {
    if (state.bootstrapping || state.bootstrapped) return

    state.bootstrapping = true
    state.error = null

    try {
      const nodeIdentity = await getSocialPersona()

      if (nodeIdentity && nodeIdentity.nodeCodeName) {
        profileStore.setProfile(nodeIdentity)
      } else {
        profileStore.clearProfile()
      }

      const list = await getSocialEntityList()
      const entities = list.socialEntities ?? []

      const skeletons: Persona[] = entities.map((entity) => ({
        id: entity.id,
        originSocialPersonaId: entity.id,
        handle: entity.handle,
        codeName: entity.codeName,
        bio: '',
        avatar: '',
        joined: '',
      }))

      personaStore.setPersonas(skeletons)

      for (const skeleton of skeletons) {
        try {
          const enriched = await personaStore.loadPersonaProfile(skeleton.id)
          if (enriched) {
            personaStore.mergePersona(enriched)
          }
        } catch {
          /* profile not in storage yet — keep skeleton, continue */
        }
      }


      /* T-Bots (old app.js:114 dispatch socialBots/fetchSocialBots).
         Old fetchSocialBots had its own try/catch that swallowed failures
         and never failed bootstrap — same here. */
      let bots: Bot[] = []
      try {
        const botList = await getBotEntityList()
        if (botList.result === 'Ok' && botList.socialEntities) {
          bots = botList.socialEntities.map((entity) => ({
            id: entity.id,
            handle: entity.handle,
            codeName: entity.codeName,
            bio: entity.bio || '',
            avatar: entity.avatar || '',
            joined: entity.joined || '',
            location: 'Live on the internet',
          }))
          botStore.setBots(bots)
        }
      } catch {
        /* bots fetch failed — keep bootstrap alive, selector shows empty */
      }

      /* Step 7 — background bot profile enrichment; deliberately not
         awaited (old app.js:114 fire-and-forget dispatch; task: do not
         block the application while waiting for profiles). */
      if (bots.length > 0 && personaStore.allPersonaIds.length > 0) {
        void enrichBotProfiles(bots)
      }
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Bootstrap failed'
    } finally {
      state.bootstrapping = false
      state.bootstrapped = true
    }
  }

  return {
    bootstrapState: toRefs(state),
    bootstrap,
  }
}
