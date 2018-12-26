import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString
} from 'graphql'

const ExchangeType = new GraphQLObjectType({
  name: 'Exchange',
  fields: () => ({
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    description: {type: GraphQLString}
  })
})

export default ExchangeType
