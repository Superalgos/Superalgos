import { logger } from '../../../logger'

import FB_FRAGMENT from '../../fragments/FBFragment'

export const fbByFbId = async (parent, { fbId }, ctx, info) => {
  logger.info(`fbByFbId: ${fbId}`)
  let FB = await ctx.db.query.financialBeings({where: {id: fbId}}, FB_FRAGMENT)
  logger.info(`fbByFbId response: ${JSON.stringify(await FB)}`)
  return FB
}

export const fbByFbSlug = async (parent, { fbSlug }, ctx, info) => {
  logger.info(`fbByFbSlug: ${fbSlug}`)
  let FB = await ctx.db.query.financialBeingses({where: {slug: fbSlug}}, FB_FRAGMENT)
  logger.info(`fbByFbSlug response: ${JSON.stringify(await FB)}`)
  return FB
}
