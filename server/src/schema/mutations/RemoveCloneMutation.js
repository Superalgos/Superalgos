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
//import saveAuditLog from './AddAuditLog'

const args = {
  id: {type: new GraphQLNonNull(GraphQLID)}
}

const resolve = async (parent, { id }, context) => {
  logger.debug('removeClone -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  await removeKuberneteClone(id)

  var query = {
    _id: id,
    authId: context.userId
  }

  //saveAuditLog(id, 'removeClone', context)
  logger.debug('removeClone -> Removing Clone from DB.')
  Clone.deleteOne(query, function (err) {
    if (err){
      throw new OperationsError(err)
    }else{
      return 'Clone Removed'
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
