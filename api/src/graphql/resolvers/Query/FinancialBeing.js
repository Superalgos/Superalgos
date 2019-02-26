import { logger } from '../../../logger'

import FB_FRAGMENT from '../../fragments/FBFragment'

export const fbByFbId = async (parent, { fbId }, ctx, info) => {
  logger.info(`fbByFbId: ${fbId}`)
  let FB = await ctx.db.query.financialBeings({where: {id: fbId}}, FB_FRAGMENT)
  logger.info(`fbByFbId response: ${JSON.stringify(await FB)}`)
  return FB
}
