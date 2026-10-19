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

/*
 * Raw timeline event as returned by the Social Graph EVENTS query
 * (SocialGraphNetworkServiceClient.js:107-111 response shape, enriched
 * at Events.js:207-279 addToResponse). Post-type events additionally
 * carry postText/postImage/userName filled from Open Storage
 * (SocialGraphNetworkServiceClient.js:93-99). Fields are optional
 * because event types carry different subsets.
 */
export interface RawTimelineEvent {
  originPostHash?: string
  originSocialPersonaId?: string
  targetSocialPersonaId?: string
  originSocialTradingBotId?: string
  targetSocialTradingBotId?: string
  postText?: string
  postImage?: string | null
  userName?: string
  avatar?: string
  eventType?: number
  postType?: number | null
  timestamp?: number
  targetPostHash?: string | null
  originPost?: {
    repliesCount?: number
    reactions?: unknown[][]
    reaction?: number
  }
  repliesCount?: number
  reactions?: unknown[][]
  reaction?: number
  fileKeys?: unknown
  eventId?: string
}

export interface TimelineEnvelope {
  result: 'Ok' | 'Error'
  message: string
  data?: RawTimelineEvent[]
}

/*
 * Port of the old UI's PostService.timeline (PostService.js:17-25):
 * GET /posts/feed with params { originSocialPersonaId } — traced:
 * post.routes.js:23-24 → posts.controller getFeed → post.service.js:1-24
 * builds queryMessage { queryType: EVENTS, originSocialPersonaId, amountRequested: 80,
 * INITIAL_INDEX_LAST, DIRECTION_PAST } → Social Graph EVENTS query
 * (SocialGraphNetworkServiceClient.js:74-114). Backend quirk (shared with the
 * old UI, frontend-only scope so left as-is): post.service.js:5 reads
 * req.originSocialPersonaId (not req.query), so the query always uses the
 * node's default persona; the param is still sent per the old contract.
 * Response envelope { result, message, data: events[] } (string-or-object
 * body — parseEnvelope; old UI read response.data.data via axios forced
 * JSON parsing, same result).
 * Same 10s timeout rationale as profileService.getProfile: the query routes
 * through the Social Graph / Open Storage; with no reachable peer the
 * request hangs forever (old UI had no timeout — its bootstrap would hang
 * on the first posts fetch; the bounded wait keeps bootstrap completing).
 */
export async function getTimelineFeed(originSocialPersonaId: string): Promise<TimelineEnvelope> {
  const response = await http.get('/posts/feed', {
    params: { originSocialPersonaId },
    timeout: 10000,
  })
  return parseEnvelope<TimelineEnvelope>(response.data)
}

export interface CreatePostBody {
  postText: string
  postImage: string | null
  originSocialPersonaId: string
  userName: string
  avatar: string
}

export interface CreatePostEnvelope {
  result: 'Ok' | 'Error'
  message: string
  eventId?: string
}

/*
 * Port of the old UI's PostService.createPost (PostService.js:31-36):
 * POST /posts — traced post.routes.js:6-9 → posts.controller createPost →
 * post.service createPost → Social Graph ADD_POST. Response envelope
 * { result, message } (string-or-object body — parseEnvelope).
 */
export async function createPost(body: CreatePostBody): Promise<CreatePostEnvelope> {
  const response = await http.post('/posts', body)
  return parseEnvelope<CreatePostEnvelope>(response.data)
}
