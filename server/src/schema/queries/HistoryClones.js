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
  logger.debug('History Clones -> Entering Fuction.')

   if (!context.userId) {
     throw new AuthentificationError()
   }

   let clones = await Clone.find({
     authId: context.userId,
     active: false
   })

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
