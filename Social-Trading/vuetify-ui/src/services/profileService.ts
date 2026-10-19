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

export interface ProfileEnvelope {
  result: 'Ok' | 'Error'
  message: string
  profileData?: Record<string, unknown>
}

export interface SocialPersonaIdentity {
  nodeCodeName?: string
  nodeId?: string
  blockchainAccount?: string
  userProfileId?: string
  userProfileHandle?: string
  bannerPic?: string
  error?: string
}

export interface SocialEntityListItem {
  id: string
  codeName: string
  handle: string
}

export interface SocialEntityListEnvelope {
  result: 'Ok' | 'Error'
  message: string
  socialEntities?: SocialEntityListItem[]
}

export async function getSocialPersona(): Promise<SocialPersonaIdentity> {
  const response = await http.get('/users/social-persona')
  return parseEnvelope<SocialPersonaIdentity>(response.data)
}

export async function getSocialEntityList(): Promise<SocialEntityListEnvelope> {
  const response = await http.get('/users/social-entities')
  return parseEnvelope<SocialEntityListEnvelope>(response.data)
}

export async function getProfile(originSocialPersonaId: string): Promise<ProfileEnvelope> {
  const response = await http.get('/users/profile', {
    params: { originSocialPersonaId },
    /* Profile enrichment routes through the Social Graph to a network
       peer; with no peer reachable the request hangs forever (old UI
       had no timeout either). A bounded wait keeps bootstrap from
       blocking the entity lists, which are served in-memory. */
    timeout: 10000,
  })
  return parseEnvelope<ProfileEnvelope>(response.data)
}
