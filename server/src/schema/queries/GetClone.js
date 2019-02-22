import { GraphQLNonNull, GraphQLID } from 'graphql'
import { OperationsError } from '../../errors'
import { GetClonesType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import mongoose from 'mongoose'
import { isDefined } from '../../config/utils'

const args = {
  cloneId: { type: new GraphQLNonNull(GraphQLID) }
}

const resolve = async(parent, { cloneId }, context) => {
  logger.debug('Get Clone -> Entering Fuction.')

  try {
    if (mongoose.Types.ObjectId.isValid(cloneId)) {
      let existingClone = await Clone.findOne({
        _id: cloneId
      })

      if (isDefined(existingClone)) {
        return {
          id: cloneId,
          teamId: existingClone.teamId,
          botId: existingClone.botId
        }
      } else {
        throw new Error('Clone not found.')
      }
    } else {
      throw new Error('Invalid Clone ID.')
    }
    return clones
  } catch (err) {
    logger.error('Get Clone error: %s', err.stack)
    throw new OperationsError('There has been an error getting the clone. ' + err.message)
  }
}

const GetClones = {
  getClone: {
    type: GetClonesType,
    args,
    resolve
  }
}

export default GetClones
