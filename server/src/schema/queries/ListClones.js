import {
  GraphQLList
} from 'graphql'

import {
  AuthentificationError,
  OperationsError
} from '../../errors'

import { CloneType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import getCloneStatus from '../../kubernetes/getClonePodStatus'
import getCloneLogs from '../../kubernetes/getClonePodLogs'
import { getJobNameFromClone, getSelectedBot } from '../../config/utils'
import teams_FbByTeamMember from '../../graphQLCalls/teams_FbByTeamMember'
import teamAvatar from '../../graphQLCalls/teamAvatar'

const args = {}

const resolve = async(parent, args, context) => {
  logger.debug('List Clones -> Entering Fuction.')
  try{
   if (!context.userId) {
     throw new AuthentificationError()
   }

   let clones = await Clone.find({
     authId: context.userId,
     active: true
   })

   let botsByUser = await teams_FbByTeamMember(context.authorization)

   for (var i = 0; i < clones.length; i++) {
      logger.debug('List Clones -> clone: %j', clones[i])

      // TODO Refactor this code once financial beings api is ready
      let selectedBot = getSelectedBot(botsByUser.data.data.teams_FbByTeamMember, clones[i].botId)
      let cloneName = getJobNameFromClone(botsByUser.data.data.teams_FbByTeamMember.slug, selectedBot.slug, clones[i].mode)
      clones[i].kind = selectedBot.kind
      clones[i].teamName = botsByUser.data.data.teams_FbByTeamMember.name
      clones[i].botName = selectedBot.name
      clones[i].botAvatar = selectedBot.avatar

      let team = await teamAvatar(context.authorization, botsByUser.data.data.teams_FbByTeamMember.id)
      clones[i].teamAvatar = team.data.data.teams_TeamById.profile.avatar

      clones[i].state = await getCloneStatus(cloneName)
      clones[i].lastLogs = await getCloneLogs(cloneName)
   }
   return clones
 } catch (err){
    logger.error('List Clones error: %s', err.stack)
    throw new OperationsError('There has been an error listing the clones.')
 }
}

const query = {
  clones: {
    type: new GraphQLList(CloneType),
    args,
    resolve
  }
}

export default query
