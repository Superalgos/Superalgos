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
import teams_FbByTeamMember from '../../graphQLCalls/teams_FbByTeamMember'
import cloneDetails from '../cloneDetails'

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

   // TODO Refactor this code once financial beings api is ready
   // Authorization is handled by the teams module
   let botsByUser = await teams_FbByTeamMember(context.authorization)

   for (var i = 0; i < clones.length; i++) {
      clones[i] = await cloneDetails(context.authorization, botsByUser, clones[i])
      let state = await getCloneStatus(clones[i].cloneName)
      clones[i].state = state.substring(1, state.length-1)
      let lastLogs = await getCloneLogs(clones[i].cloneName)
      clones[i].lastLogs = lastLogs.substring(1, lastLogs.length-1)
      clones[i].botType = clones[i].kind // Only for listing we show the teams value
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
