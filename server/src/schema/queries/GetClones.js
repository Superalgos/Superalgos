import { GraphQLList, GraphQLID } from 'graphql'
import { OperationsError } from '../../errors'
import { GetClonesType } from '../types'
import { Clone } from '../../models'
import logger from '../../config/logger'
import mongoose from 'mongoose'
import { isDefined } from '../../config/utils'

const args = {
  cloneIdList: { type: new GraphQLList(GraphQLID) }
}

const resolve = async(parent, { cloneIdList }, context) => {
  logger.debug('Get Clones -> Entering Fuction.')
  try {
    let clones = []
    for (var i = 0; i < cloneIdList.length; i++) {
      if (mongoose.Types.ObjectId.isValid(cloneIdList[i])) {
        let existingClone = await Clone.findOne({
          _id: cloneIdList[i]
        })

        if (isDefined(existingClone)) {
          clones.push({
            id: cloneIdList[i],
            teamId: existingClone.teamId,
            botId: existingClone.botId
          })
        } else {
          clones.push({
            id: cloneIdList[i]
          })
        }
      } else {
        clones.push({
          id: cloneIdList[i]
        })
      }
    }

    return clones
  } catch (err) {
    logger.error('Get Clones error: %s', err.stack)
    throw new OperationsError('There has been an error getting the clones.')
  }
}

const GetClones = {
  getClones: {
    type: new GraphQLList(GetClonesType),
    args,
    resolve
  }
}

export default GetClones
