import merge from 'lodash.merge'

import { resolvers as queryResolvers } from './Query'
import { resolvers as mutationResolvers } from './Mutation'

export const resolvers = merge(queryResolvers, mutationResolvers)
