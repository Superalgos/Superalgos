import { logger } from '../../../logger'

import FB_FRAGMENT from '../../fragments/FBFragment'
import FB_TEAM_FRAGMENT from '../../fragments/FBTeamFragment'

import { isDefined, isNull } from '../../../utils'

export const fbByFbId = async (parent, { fbId }, ctx, info) => {
  logger.info(`fbByFbId: ${fbId}`)
  let FB = await ctx.db.query.financialBeings({where: {id: fbId}}, FB_FRAGMENT)
  logger.info(`fbByFbId response: ${JSON.stringify(await FB)}`)
  return FB
}

export const fbByFbSlug = async (parent, { fbSlug }, ctx, info) => {
  logger.info(`fbByFbSlug: ${fbSlug}`)
  let FB = await ctx.db.query.financialBeingses({where: {slug: fbSlug}, first:1}, FB_FRAGMENT)
  logger.info(`fbByFbSlug response: ${JSON.stringify(await FB)}`)
  return FB[0]
}

export const fbByOwner = async (parent, { fbId, fbSlug }, ctx, info) => {
  logger.info('teamsByOwner')
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
    return
  }
  if ((isDefined(fbId) && !isNull(fbId)) || (isDefined(fbSlug) && !isNull(fbSlug))){
    return ctx.db.query.financialBeingsesConnection({where: {AND:[{team:{members_every:{member:{authId: authId}}}},{OR:[{slug:fbSlug},{id:fbId}]}]}}, FB_TEAM_FRAGMENT)
  } else {
    return ctx.db.query.financialBeingsesConnection({where: {team:{members_every:{member:{authId: authId}}}}}, FB_TEAM_FRAGMENT)
  }
}
