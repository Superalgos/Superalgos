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

const args = {
  id: { type: new GraphQLNonNull(GraphQLID) }
}

const resolve = async (parent, { id }, context) => {
  logger.debug('removeClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  await removeKuberneteClone(id)

  const query = {
    _id: id,
    authId: context.userId
  }
  const options = { new: true }
  const update = { active: false }

  logger.debug('removeClone -> Removing Clone from DB.')
  Clone.findOneAndUpdate(query, update, options, (err, doc) => {
    if (err){
      throw new OperationsError(err)
    }else{
      resolve('Clone Removed.')
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
