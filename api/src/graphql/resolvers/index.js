import merge from 'lodash.merge'

import { resolvers as queryResolvers } from './Query'
import { resolvers as mutationResolvers } from './Mutation'

const resolvers = merge(queryResolvers, mutationResolvers)
