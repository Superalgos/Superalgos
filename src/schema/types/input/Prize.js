import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import InputSubPrizeType from './SubPrize';

const Type = new GraphQLInputObjectType({
  name: 'PrizeInput',
  description: 'Payload for formula input',
  fields: () => ({
    rank: { type: new GraphQLNonNull(GraphQLInt) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    subPrize: {
      type: new GraphQLList(InputSubPrizeType),
    },
  }),
});

export default Type;
