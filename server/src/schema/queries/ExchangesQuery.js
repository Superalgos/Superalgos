import {
  GraphQLList
} from 'graphql'
import { ExchangeType } from '../types'
import { Exchange } from '../../models'
import logger from '../../config/logger'

const args = {}

const resolve = (parent, args, context) => {
  logger.debug('exchanges -> Entering Fuction.')
  return Exchange
}

const query = {
  exchanges: {
    type: new GraphQLList(ExchangeType),
    args,
    resolve
  }
}

export default query
