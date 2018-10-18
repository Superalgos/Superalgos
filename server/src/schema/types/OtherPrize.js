import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} from 'graphql'

const OtherPrizeType = new GraphQLObjectType({
  name: 'OtherPrize',
  fields: () => ({
    condition: { type: GraphQLString },
    amount: { type: GraphQLInt },
    asset: { type: GraphQLString }
  })
})

export default OtherPrizeType
