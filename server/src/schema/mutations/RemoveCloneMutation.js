import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql'

import {
  AuthentificationError,
  OperationsError
} from '../../errors'

import { Clone } from '../../models'
import logger from '../../config/logger'
import removeKuberneteClone from '../../kubernetes/removeClone'
import teamQuery from '../../graphQLCalls/teamQuery'
import { isDefined } from '../../config/utils'
import cloneDetails from '../cloneDetails'

const args = {
  id: { type: new GraphQLNonNull(GraphQLID) }
}

const resolve = async (parent, { id }, context) => {
  logger.debug('removeClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  let clone = await Clone.findOne({
    _id: id,
    authId: context.userId,
    active: true
  })

  if(!isDefined(clone)){
    throw new OperationsError('You are not authorized to remove this clone.')
  }

  let team = await teamQuery(context.authorization, clone.teamId)
  clone = await cloneDetails(context.userId, team.data.data.teams_TeamById, clone)

  logger.debug('removeClone -> Release the clone key.')
  await authorizeClone(context.authorization, clone.keyId, clone.id, true)

  logger.debug('removeClone -> Removing Clone from Kubernates.')
  await removeKuberneteClone(clone)

  const query = {
    _id: id,
    authId: context.userId
  }
  const options = { new: true }
  const update = { active: false }

  Clone.findOneAndUpdate(query, update, options, (err, doc) => {
    if (err){
      logger.error('removeClone -> Error removing clone from the DB. %s', err.stack)
      throw new OperationsError(err)
    }else{
      logger.debug('removeClone -> Clone Removed from the DB.')
      return('Clone Removed.')
    }
  })
}

const RemoveCloneMutation = {
  removeClone: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default RemoveCloneMutation
