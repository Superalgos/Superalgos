import {
  GraphQLList,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'

import {
  AuthentificationError
} from '../../errors'

import { AuditLogType } from '../types'
import { AuditLog } from '../../models'
import logger from '../../config/logger'

const args = {
  key: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { key }, context) => {
  logger.debug('auditLogs -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthentificationError()
  }

  return AuditLog.find({
    authId: context.userId,
    keyId: key
  }).sort({date: -1}).limit(20)
}

const query = {
  auditLogs: {
    type: new GraphQLList(AuditLogType),
    args,
    resolve
  }
}

export default query
