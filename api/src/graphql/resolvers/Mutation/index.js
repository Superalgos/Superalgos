import { getUser } from '../../../middleware/getMember'

import { sendTeamMemberInvite, sendTeamCreateConfirmation, verifyInviteToken } from '../../../email/sendgrid'

import TEAMS_CONNECTIONS_FRAGMENT from '../../fragments/TeamsConnectionsFragment'
import TEAMS_FRAGMENT from '../../fragments/TeamsFragment'
import TEAM_FB_FRAGMENT from '../../fragments/TeamFBFragment'

import { logger, AuthenticationError } from '../../../logger'

export const resolvers = {
  Mutation: {
    async sendMemberInviteSG(parent, { email, teamId }, ctx, info) {
      const team = await ctx.db.query.team({ where: { id: teamId } }, TEAMS_FRAGMENT)
      const addMember = await ctx.db.mutation.upsertTeamMembers({
        where:{email: email},
        create:{role:'MEMBER', email:email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invited by ${team.members[0].member.alias}`}}},
        update:{role: 'MEMBER', email: email, team: {connect: {id: teamId}}, status:{create:{status: 'INVITED', reason: `Invite resent by ${team.members[0].member.alias}`}}}},
        `{ id }`)
      const sendInvite = await sendTeamMemberInvite(email, team)
      return sendInvite
    },
    async verifyTeamInvite(parent, { token }, ctx, info) {
      let verifiedToken = null
      let team = null
      try {
        verifiedToken = await verifyInviteToken(token)
        team = {
          email: verifiedToken.email,
          team: {
            slug: verifiedToken.team
          }
        }
        logger.info('verifyTeamInvite.token: ', await verifiedToken)
      } catch (err) {
        logger.debug('verifyTeamInvite. err: ', err)
        throw new Error(err.message)
      }
      return team
    },
    async createTeam(parent, { name, slug, botName, botSlug }, ctx, info) {
      logger.info('createTeam ctx.request.user:')
      logger.info(ctx.request.user)

      const authId = ctx.request.headers.userid
      if (!authId) {
        throw new AuthenticationError()
      }

      return getUser(authId)
        .then(async result => {
          logger.info('axios:')
          logger.info(result)

          const alias = result.data.users_User.alias
          const email = result.data.users_User.email
          const avatar = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-avatar-default.png'
          const banner = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-banner-default.png'

          const createTeamUrl = encodeURI(`${slug}/${name}/${alias}/${botSlug}/${botName}`)
          logger.info('createTeamUrl:')
          logger.info(JSON.stringify(await createTeamUrl))

          const platformUrl = 'https://develop.advancedalgos.net/AABrowserAPI/newTeam/'
          // const platformUrl = 'http://localhost:1337/AABrowserAPI/teamSetup/'

          logger.info(`${platformUrl}${createTeamUrl}/${authId}`)
          const createPlatformTeam = await axios.get(`${platformUrl}${createTeamUrl}/${authId}`)
            .then((result) => {
              console.log('createPlatformTeam result:', result.data)
              if(result.data.message === 'Team Name already taken'){
                return result.data.message
              }
              if(result.data.result === 'Fail'){
                return result.data.message
              }
              return result
            })
            .catch(err =>{
              logger.debug('createPlatformTeam err:')
              logger.debug(err)
              throw new Error(err)
            })
          console.log('createPlatformTeam returned: ', await createPlatformTeam)
          if(await createPlatformTeam === 'Team Name already taken'){
            return createPlatformTeam
          }

          const existingMember = await ctx.db.query.member({ where: { authId } }, `{id}`)
            .catch((err) => {
              logger.debug(err, 'existingMember error: ')
              return err
            })

          logger.info('existingMember:')
          logger.info(await existingMember)

          let createTeam
          if(existingMember.id !== null){
            logger.info('createTeam with existingMember:')
            createTeam = await ctx.db.mutation.createTeam({ data: {name: name, slug: slug, owner: authId, members: {create: {member: {connect: {authId: authId}}, role: 'OWNER', status: { create: { status: 'ACTIVE', reason: `Connected to Team ${name}`}}}}, profile: {create: {avatar: avatar, banner: banner}}, fb: {create: {name: botName, slug: botSlug, kind:'TRADER', avatar: avatar, status: {create: {status: 'ACTIVE', reason: "Cloned on team creation"}}}}, status: {create: {status: 'ACTIVE', reason:"Team created"}}} }, TEAMS_FRAGMENT)
              .catch((err) => {
                logger.debug(err, 'createTeamMutation error: ')
                return err
              })
          } else {
            logger.info('createTeam without existingMember:')
            createTeam = await ctx.db.mutation.createTeam({ data: {name: name, slug: slug, owner: authId, members: {create: {member: {create: {authId: authId, alias: alias, visible:'true', status: { create: { status: 'ACTIVE', reason: `Created team ${name}`}}}}, role: 'OWNER', status: { create: { status: 'ACTIVE', reason: `Created with Team ${name}`}}}}, profile: {create: {avatar: avatar, banner: banner}}, fb: {create: {name: botName, slug: botSlug, kind:'TRADER', avatar: avatar, status: {create: {status: 'ACTIVE', reason: "Cloned on team creation"}}}}, status: {create: {status: 'ACTIVE', reason:"Team created"}}} }, TEAMS_FRAGMENT)
              .catch((err) => {
                logger.debug(err, 'createTeamMutation error: ')
                return err
              })
          }

          // sendTeamCreateConfirmation(email, name, botName)

          return createTeam
        })
        .catch((err) => {
          logger.debug('createTeam error: ')
          return err
        })
    },
    async updateTeamProfile(parent, { slug, owner, description, motto, avatar, banner }, ctx, info) {
      return ctx.db.mutation.updateTeam({data:{profile: {update: {description: description, motto: motto, avatar: avatar, banner: banner}}}, where:{slug: slug}}, TEAMS_FRAGMENT)
        .catch((err) => {
          logger.debug('createTeam error: ', err)
          return err
        })
    },
    async updateFB(parent, { fbId, avatar}, ctx, info) {
      return ctx.db.mutation.updateFinancialBeings({data:{avatar:avatar}, where:{id:fbId}}, info)
        .catch((err) => {
          logger.debug('createTeam error: ', err)
          return err
        })
    },
    async deleteTeam(parent, { slug }, ctx, info) {
      return ctx.db.mutation.deleteTeam({ where: { slug } }, info)
        .catch((res) => {
          logger.info('deleteTeam error: ', res)
          const errors = res.graphQLErrors.map((error) => {
            return error.message
          })
        })
    }
  }
}
