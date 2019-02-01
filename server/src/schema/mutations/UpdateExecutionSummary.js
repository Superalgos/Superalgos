import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat
} from 'graphql'

import {
  OperationsError
} from '../../errors'

import { Clone } from '../../models'
import logger from '../../config/logger'
import teamQuery from '../../graphQLCalls/teamQuery'

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
    throw new AuthentificationError()
  }

  try{
    let sucessful

    let clone = await Clone.findOne( {
      _id: id,
      active: true
    })

    let team = await teamQuery(context.authorization)
    clone = await cloneDetails(context.userId, team.data.data.teams_TeamById, clone)

    logger.debug('removeClone -> Removing Clone from Kubernates.')
    await removeKuberneteClone(clone)

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

    await Clone.update(query, update, (err) => {
      if (err){
        logger.error('Error updating execution summary on the database. %s', err.stack)
        throw new OperationsError(err.message)
      } else {
        logger.debug('Execution summary updated.')
        sucessful = true
      }
    })

    if(sucessful){
      return 'Execution summary updated.'
    }
  } catch (error) {
    logger.error('Error updating the execution summary. %s', error.stack)
    throw new OperationsError(error.message)
  }
}

const mutation = {
  updateExecutionSummary: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default mutation
