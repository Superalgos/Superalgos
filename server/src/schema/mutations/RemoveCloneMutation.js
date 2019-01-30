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
import teams_FbByTeamMember from '../../graphQLCalls/teams_FbByTeamMember'
import { isDefined, getSelectedBot } from '../../config/utils'
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

  let botsByUser = await teams_FbByTeamMember(context.authorization)
  clone = await cloneDetails(context.authorization, botsByUser, clone)

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

const mutation = {
  removeClone: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default mutation
