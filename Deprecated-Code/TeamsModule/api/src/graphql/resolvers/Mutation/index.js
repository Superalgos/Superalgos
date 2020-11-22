import axios from 'axios'
import { ApolloError } from 'apollo-server-express'

import { getUser } from '../../../middleware/getMember'
import { createStrategy } from './createStrategy'

import { notifications_sendTeamCreateConfirmation, notifications_sendTeamMemberInvite, notifications_VerifyTeamMemberInviteToken } from '../notifications/sendgrid'

import TEAMS_CONNECTIONS_FRAGMENT from '../../fragments/TeamsConnectionsFragment'
import TEAMS_FRAGMENT from '../../fragments/TeamsFragment'
import FB_FRAGMENT from '../../fragments/FBFragment'

import { logger, AuthenticationError, ServiceUnavailableError, DatabaseError, ConflictError } from '../../../logger'

export const resolvers = {
  Mutation: {
    async sendMemberInviteSG(parent, { email, teamId }, ctx, info) {
      const team = await ctx.db.query.team({ where: { id: teamId } }, TEAMS_FRAGMENT)
      const addMember = await ctx.db.mutation.upsertTeamMembers({
        where:{email: email},
        create:{role:'MEMBER', email:email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invited by ${team.members[0].member.alias}`}}},
        update:{role: 'MEMBER', email: email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invite resent by ${team.members[0].member.alias}`}}}},
        `{ id }`)
      const sendInvite = await notifications_sendTeamMemberInvite(email, team)
      return sendInvite
    },
    async verifyTeamInvite(parent, { token }, ctx, info) {
      let verifiedToken = null
      let team = null
      try {
        verifiedToken = await notifications_VerifyTeamMemberInviteToken(token)
        team = {
          email: verifiedToken.email,
          team: {
            slug: verifiedToken.team
          }
        }
        logger.info('verifyTeamInvite.token: ', await verifiedToken)
      } catch (err) {
        logger.debug('verifyTeamInvite. err: ', err)
        throw new DatabaseError(err.message)
      }
      return team
    },
    async createTeam(parent, { name, slug, botName, botSlug }, ctx, info) {
      logger.info('createTeam ctx.request.user:')
      logger.info(ctx.request.headers.userid)
      const authId = ctx.request.headers.userid
      if (!authId) {
        throw new AuthenticationError()
      }
      const userData = await getUser(authId)
      logger.info('userData:')
      logger.info(JSON.stringify(await userData))
      const alias = await userData.data.users_User.alias
      const email = await userData.data.users_User.email
      const avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
      const banner = process.env.STORAGE_URL + '/module-teams/module-default/aa-banner-default.png'

      const createTeamUrl = encodeURI(`${slug}/${name}/${alias}/${botSlug}/${botName}`)
      logger.info('createTeamUrl:')
      logger.info(JSON.stringify(await createTeamUrl))

      const chartsUrl = process.env.CHARTS_URL + '/AABrowserAPI/newTeam/'

      logger.info(`${chartsUrl}${createTeamUrl}/${authId}`)
      const createPlatformTeam = await axios.get(`${chartsUrl}${createTeamUrl}/${authId}/${process.env.AAWEB_TEAM_SHARED_SECRET}`)
        .then((result) => {
          console.log('createPlatformTeam result:', result.data)
          if(result.data.message === 'Team Name already taken'){
            return { error: 'Team already exist on AA Cloud.', code: 409 }
          }
          if(result.data.result === 'Fail'){
            return { error: `${result.data.message} - Creating team on AA Cloud has failed`, code: 404 }
          }
          return result
        })

      logger.info('createPlatformTeam')
      logger.info(await createPlatformTeam)
      logger.info('createPlatformTeam Error')
      logger.error(await createPlatformTeam.error)
      logger.info('createPlatformTeam Code')
      logger.error(await createPlatformTeam.code)

      // if (await createPlatformTeam.error && await createPlatformTeam.code === 404) throw new ApolloError(await createPlatformTeam.error, 404)
      // if (await createPlatformTeam.error && await createPlatformTeam.code === 409) throw new ApolloError(await createPlatformTeam.error, 409)

      const existingMember = await ctx.db.query.member({ where: { authId } }, `{id}`)
        .catch((err) => {
          logger.debug(err, 'existingMember error: ')
          throw new DatabaseError(err)
        })

      logger.debug('existingMember:')
      logger.debug(await existingMember)

      let createTeam
      if(existingMember !== null && existingMember.id !== null){
        logger.info('createTeam with existingMember:')
        createTeam = await ctx.db.mutation.createTeam({ data: {name: name, slug: slug, owner: authId, members: {create: {member: {connect: {authId: authId}}, role: 'OWNER', status: { create: { status: 'ACTIVE', reason: `Connected to Team ${name}`}}}}, profile: {create: {avatar: avatar, banner: banner}}, fb: {create: {name: botName, slug: botSlug, kind:'Trading', avatar: avatar, status: {create: {status: 'ACTIVE', reason: "Cloned on team creation"}}}}, status: {create: {status: 'ACTIVE', reason:"Team created"}}} }, TEAMS_FRAGMENT)
          .catch((err) => {
            logger.debug(err, 'createTeamMutation error: ')
            return new DatabaseError(err)
          })
      } else {
        logger.info('createTeam without existingMember:')
        createTeam = await ctx.db.mutation.createTeam({ data: {name: name, slug: slug, owner: authId, members: {create: {member: {create: {authId: authId, alias: alias, visible: true, status: { create: { status: 'ACTIVE', reason: `Created team ${name}`}}}}, role: 'OWNER', status: { create: { status: 'ACTIVE', reason: `Created with Team ${name}`}}}}, profile: {create: {avatar: avatar, banner: banner}}, fb: {create: {name: botName, slug: botSlug, kind:'Trading', avatar: avatar, status: {create: {status: 'ACTIVE', reason: "Cloned on team creation"}}}}, status: {create: {status: 'ACTIVE', reason:"Team created"}}} }, TEAMS_FRAGMENT)
          .catch((err) => {
            logger.debug(err, 'createTeamMutation error: ')
            return new DatabaseError(err)
          })

      }
      let createFB;
      if(createTeam){
        createFB = await ctx.db.mutation.createFinancialBeings({ data:{
            type:'BOT',
            kind:'Indicator',
            name:'Simulator ' + botName,
            slug:'simulator-' + botSlug,
            avatar:avatar,
            team: {
              connect:{
                id:createTeam.id
              }
            }
          }
        }, FB_FRAGMENT)
            .catch((err) => {
              logger.debug(err, 'Error creating the simulator: ')
              return new DatabaseError(err)
            })
        logger.info('createTeam creating simulator success')
        logger.info(JSON.stringify(await createFB))
        let createdStrategy
        if(await createFB){
          logger.info('createStrategy:' + 'simulator-' + botSlug)
          createdStrategy =  await createStrategy('simulator-' + botSlug)
          logger.info('createStrategy:')
          logger.info(JSON.stringify(await createStrategy))
        }
      }
      /* **temporarily disable team creation confirmation
      if(await createTeam && await createFB && await createStrategy){
        notifications_sendTeamCreateConfirmation(email, name, botName)
      }
      */
      return createTeam
    },
    async updateTeamProfile(parent, { slug, owner, description, motto, avatar, banner }, ctx, info) {
      return ctx.db.mutation.updateTeam({data:{profile: {update: {description: description, motto: motto, avatar: avatar, banner: banner}}}, where:{slug: slug}}, TEAMS_FRAGMENT)
        .catch((err) => {
          logger.debug('createTeam error: ', err)
          throw new DatabaseError(`Team Profile Update Error: ${err}`)
        })
    },
    async updateFB(parent, { fbId, avatar}, ctx, info) {
      return ctx.db.mutation.updateFinancialBeings({data:{avatar:avatar}, where:{id:fbId}}, info)
        .catch((err) => {
          logger.debug('createTeam error: ', err)
          throw new DatabaseError(`Update Financial Being Error: ${err}`)
        })
    },
    async deleteTeam(parent, { slug, botSlug }, ctx, info) {
      logger.info('deleteTeam ctx.request.user:')
      logger.info(ctx.request.headers.userid)
      const authId = ctx.request.headers.userid
      if (!authId) {
        throw new AuthenticationError()
      }
      logger.info(authId)
      logger.info('getUser')
      logger.info(getUser)

      return getUser(authId)
        .then(async result => {
          logger.info('deleteTeam axios:')
          logger.info(await result)

          const alias = await result.data.users_User.alias
          // const email = result.data.users_User.email
          const deleteTeamUrl = encodeURI(`${slug}/${alias}/${botSlug}`)
          logger.info('deleteTeamUrl:')
          logger.info(JSON.stringify(await deleteTeamUrl))

          const chartsUrl = process.env.CHARTS_URL + '/AABrowserAPI/deleteTeam/'

          logger.info(`${chartsUrl}${deleteTeamUrl}/${authId}`)
          const deletePlatformTeam = await axios.get(`${chartsUrl}${deleteTeamUrl}/${authId}/${process.env.AAWEB_DELETE_TEAM_SHARED_SECRET}`)
            .then((result) => {
              console.log('deletePlatformTeam result:', result.data)
              if(result.data.result === 'Fail'){
                throw new DatabaseError(result.data.message)
              }
              return result
            })
            .catch(err =>{
              logger.debug('deletePlatformTeam err:')
              logger.debug(err)
              throw new DatabaseError(err)
            })
          console.log('deletePlatformTeam returned: ', await deletePlatformTeam)

          return ctx.db.mutation.deleteTeam({ where: { slug } }, info)
            .catch((res) => {
              logger.info('deleteTeam error: ', res)
              const errors = res.graphQLErrors.map((error) => {
                throw new DatabaseError(error.message)
              })
            })
        })
        .catch((err) => {
          logger.debug('deleteTeam error: ')
          throw new DatabaseError(err)
        })
    }
  }
}
