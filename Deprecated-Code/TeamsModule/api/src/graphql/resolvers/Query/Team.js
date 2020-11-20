import { logger, AuthenticationError, DatabaseError } from '../../../logger'

import TEAMS_CONNECTIONS_FRAGMENT from '../../fragments/TeamsConnectionsFragment'
import TEAMS_FRAGMENT from '../../fragments/TeamsFragment'

export const teams = async (parent, args, ctx, info) => {
  logger.info('teams')
  return ctx.db.query.teamsConnection({}, TEAMS_CONNECTIONS_FRAGMENT)
}

export const teamsByIds = async (parent, { teamIds }, ctx, info) => {
  logger.info('teamsByIds')
  logger.info(teamIds)
  return ctx.db.query.teams({where: { id_in: teamIds } }, TEAMS_FRAGMENT)
}

export const teamById = async (parent, { teamId }, ctx, info) => {
  logger.info('teamById')
  logger.info(teamId)
  return ctx.db.query.team({ where: { id: teamId } }, TEAMS_FRAGMENT)
}

export const teamByName = async (parent, { name }, ctx, info) => {
  return ctx.db.query.team({ where: { name: name } }, TEAMS_FRAGMENT)
}

export const teamBySlug= async (parent, { slug }, ctx, info) => {
  logger.info('teamsBySlug')
  logger.info(`slug: ${slug}`)
  return ctx.db.query.team({ where: { slug: slug } }, TEAMS_FRAGMENT)
}

export const teamWithRole = async (parent, { teamId, role }, ctx, info) => {
  return ctx.db.query.teamsConnection({where: {AND: [{id: teamId},{members_some:{role: role}}]}, first:1}, info)
}

export const teamAuthorization = async (parent, { teamId, role }, ctx, info) => {
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
    return
  }
  if(role == undefined || role == null){
    return ctx.db.query.teamsConnection({where:{ AND:{id:teamId,members_some:{member:{authId:authId}, role_in:['OWNER','ADMIN']}}}, first:1}, info)
  } else {
    return ctx.db.query.teamsConnection({where:{ AND:{id:teamId,members_some:{member:{authId:authId}, role:role}}}, first:1}, info)
  }
}

export const teamsByOwner = async (parent, args, ctx, info) => {
  logger.info('teamsByOwner')
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
    return
  }
  return ctx.db.query.teams({where: { owner: authId }, orderBy:'createdAt_DESC'}, TEAMS_FRAGMENT)
}

export const teamsByRole = async (parent, args, ctx, info) => {
  const authId = ctx.request.headers.userid
  if (!authId) {
    throw new AuthenticationError()
  }
  let teamAdmin
  try {
    teamAdmin= await ctx.db.query.teams({where: {members_some: {AND: [{member: {authId: authId}, role_not:'MEMBER'}]}}}, TEAMS_FRAGMENT)
  } catch (err) {
    logger.debug('teamsByRole error: ')
    logger.debug(err)
    const errors = err.graphQLErrors.map((error) => {
      throw new DatabaseError(error.message)
    })
  }
  logger.info('teamsByRole teamAdmin: ', teamAdmin)
  return teamAdmin
}
