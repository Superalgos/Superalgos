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

const args = {}

const resolve = async(parent, args, context) => {
  logger.debug('List Clones -> Entering Fuction.')

   if (!context.userId) {
     throw new AuthentificationError()
   }

   let clones = await Clone.find({authId: context.userId})

   for (var i = 0; i < clones.length; i++) {
       clones[i].state = await getKuberneteClonePodStatus(clones[i]._id)
       clones[i].lastLogs = await getKuberneteClonePodLogs(clones[i]._id)
   }
   return clones
}

const query = {
  clones: {
    type: new GraphQLList(CloneType),
    args,
    resolve
  }
}

export default query
