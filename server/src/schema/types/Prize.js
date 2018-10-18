import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt
} from 'graphql'
import { OtherPrizeType } from './index'

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  fields: () => ({
    position: { type: GraphQLInt },
    algoPrize: { type: GraphQLInt },
    otherPrizes: {
      type: new GraphQLList(OtherPrizeType),
      resolve (parent, args) {
        return parent.otherPrizes
      }
    }
  })
})

export default PrizeType
