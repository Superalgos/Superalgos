import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql'
import { OperationsError, AuthorizationError, AuthenticationError } from '../../errors'
import { Clone } from '../../models'
import logger from '../../config/logger'
import { isDefined } from '../../config/utils'

const args = {
  id: { type: new GraphQLNonNull(GraphQLID) },
  summaryDate: { type: GraphQLInt },
  buyAverage: { type: GraphQLFloat },
  sellAverage: { type: GraphQLFloat },
  marketRate: { type: GraphQLFloat },
  combinedProfitsA: { type: GraphQLFloat },
  combinedProfitsB: { type: GraphQLFloat },
  assetA: { type: GraphQLString },
  assetB: { type: GraphQLString }
}

const resolve = async (parent,
  { id, summaryDate, buyAverage, sellAverage, marketRate, combinedProfitsA,
    combinedProfitsB, assetA, assetB
  }, context) => {
  logger.debug('UpdateExecutionSummary -> Entering Function.')

  if (!context.userId) {
    throw new AuthenticationError()
  }

  if (!(context.userId === process.env.AACLOUD_ID)) {
    logger.debug('User %s is not authorized to manage team %s.', authId, team.slug)
    throw new AuthorizationError()
  }

  try {
    let clone = await Clone.findOne({
      _id: id,
      active: true
    })

    if (!isDefined(clone)) {
      return 'Clone not found.'
    }

    const query = { _id: id }
    const options = { new: true }
    const update = {
      summaryDate: summaryDate,
      buyAverage: buyAverage,
      sellAverage: sellAverage,
      marketRate: marketRate,
      combinedProfitsA: combinedProfitsA,
      combinedProfitsB: combinedProfitsB,
      assetA: assetA,
      assetB: assetB
    }

    logger.debug('UpdateExecutionSummary -> Updating clone on database.')

    return new Promise((res, rej) => {
      Clone.update(query, update, options, (err, clone) => {
        if (err) {
          logger.error('Error updating execution summary on the database. %s', err.stack)
          rej(err)
          return
        }
        logger.debug('Execution summary updated.')
        res('Execution summary updated.')
      })
    })

  } catch (error) {
    logger.error('Error updating the execution summary. %s', error.stack)
    throw new OperationsError(error.message)
  }
}

const UpdateExecutionSummary = {
  updateExecutionSummary: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default UpdateExecutionSummary
