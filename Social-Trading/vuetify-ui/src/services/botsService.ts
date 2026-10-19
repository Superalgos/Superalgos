import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:33248',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/*
 * The express interface (Client/expressHttpInterface) always responds HTTP 200;
 * errors travel inside the body envelope. webAppInterface.stringify's some
 * responses, so a string body is parsed defensively (same convention as the
 * old UI's BotsService).
 */
function parseEnvelope<T>(data: unknown): T {
  if (typeof data === 'string') {
    return JSON.parse(data) as T
  }
  return data as T
}

export interface BotEntityListItem {
  id: string
  codeName: string
  handle: string
  bio?: string
  avatar?: string
  joined?: string
}

export interface BotEntityListEnvelope {
  result: 'Ok' | 'Error'
  message: string
  socialEntities?: BotEntityListItem[]
}

/*
 * Port of the old UI's BotsService.fetchBots (BotsService.js:12-20):
 * GET /bots/social-entities — same envelope shape as the users list.
 * The old fn returned undefined unless result === 'Ok'; here the envelope
 * is returned as-is and the caller checks result (established convention).
 */
export async function getBotEntityList(): Promise<BotEntityListEnvelope> {
  const response = await http.get('/bots/social-entities')
  return parseEnvelope<BotEntityListEnvelope>(response.data)
}

export interface BotProfileEnvelope {
  result: 'Ok' | 'Error'
  message: string
  profileData?: Record<string, unknown>
}

/*
 * Port of the old UI's BotsService.getProfile (BotsService.js:34-44):
 * GET /bots/profile with { originSocialPersonaId, originSocialTradingBotId,
 * codeName } — traced: bots.route.js:24-25 → bots.controller loadProfile →
 * bot.service.js:74-91 builds profileMessage { profileType: LOAD_SOCIAL_ENTITY,
 * originSocialPersonaId, originSocialTradingBotId, codeName } → Social Graph →
 * socialEntitiesStorage.loadSocialEntityFromStorage loads
 * Bots/<codeName>/Profile/<botId>.json from the persona's storage.
 * The controller res.json's the stringified envelope; parseEnvelope undoes
 * that (old BotsService.getProfile did JSON.parse(response.data) — same).
 * Success envelope (SocialEntitiesStorage.js:305-309):
 * { result: 'Ok', message: 'Social Entity Profile Found', profileData }.
 * Same 10s timeout rationale as profileService.getProfile.
 */
export async function getBotProfile(params: {
  originSocialPersonaId: string
  originSocialTradingBotId: string
  codeName: string
}): Promise<BotProfileEnvelope> {
  const response = await http.get('/bots/profile', { params, timeout: 10000 })
  return parseEnvelope<BotProfileEnvelope>(response.data)
}
