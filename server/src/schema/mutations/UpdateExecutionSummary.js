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
    }) => {
  logger.debug('UpdateExecutionSummary -> Entering Function.')

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

  let sucessful
  await Clone.findOneAndUpdate(query, update, options, (err, doc) => {
    if (err){
      throw new OperationsError(err)
    } else {
      logger.debug('Execution summary updated')
      sucessful = true
    }
  })

  if(sucessful){
    return 'Execution summary updated.'
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
