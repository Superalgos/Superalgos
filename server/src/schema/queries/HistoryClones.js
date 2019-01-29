import {
  GraphQLList
} from 'graphql'

import {
  AuthentificationError
} from '../../errors'

import { CloneType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import getKuberneteClonePodStatus from '../../kubernetes/getClonePodStatus'
import getKuberneteClonePodLogs from '../../kubernetes/getClonePodLogs'
import teams_FbByTeamMember from '../../graphQLCalls/teams_FbByTeamMember'
import cloneDetails from './cloneDetails'

const args = {}

const resolve = async(parent, args, context) => {
  logger.debug('History Clones -> Entering Fuction.')

   if (!context.userId) {
     throw new AuthentificationError()
   }

   let clones = await Clone.find({
     authId: context.userId,
     active: false
   })

   // TODO Refactor this code once financial beings api is ready
   // Authorization is handled by the teams module
   let botsByUser = await teams_FbByTeamMember(context.authorization)

   for (var i = 0; i < clones.length; i++) {
      clones[i] = await cloneDetails(context.authorization, botsByUser, clones[i])
   }

   return clones
}

const query = {
  historyClones: {
    type: new GraphQLList(CloneType),
    args,
    resolve
  }
}

export default query
