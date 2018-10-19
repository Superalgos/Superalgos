import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql'

import { HostCompetitionMutation } from './mutations'
import {
  CompetitionsQuery,
  CompetitionsByHostQuery
} from './queries'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    CompetitionsQuery,
    CompetitionsByHostQuery
  )
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation
  )
})

const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})

export default Schema
