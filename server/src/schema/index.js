import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql'

import {
  HostCompetitionMutation,
  RegisterToCompetitionMutation
} from './mutations'
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
    HostCompetitionMutation,
    RegisterToCompetitionMutation
  )
})

const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})

export default Schema
