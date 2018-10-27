import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString
} from 'graphql'

const RuleType = new GraphQLObjectType({
  name: 'Rule',
  fields: () => ({
    position: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString }
  })
})

export default RuleType
