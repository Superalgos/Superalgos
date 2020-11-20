import { logger } from '../../../logger'

import TEAM_FB_FRAGMENT from '../../fragments/TeamFBFragment'

export const fbByTeamMember = async (parent, args, ctx, info) => {
  logger.info('fbByTeamMember: ', args, ctx.request, ctx.request.res.req.user)
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
  }
  let teamMemberFB = await ctx.db.query.teams({where: {members_some: {AND: [{member: {authId: authId}}]}}, orderBy: 'createdAt_DESC'}, TEAM_FB_FRAGMENT)
  logger.info('fbByTeamMember response: ', await teamMemberFB[0])
  return teamMemberFB[0]
}
