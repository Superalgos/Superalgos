import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import InputAdditionalPrizeType from './AdditionalPrize';

const Type = new GraphQLInputObjectType({
  name: 'PrizeInput',
  description: 'Payload for formula input',
  fields: () => ({
    rank: { type: new GraphQLNonNull(GraphQLInt) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    additional: {
      type: new GraphQLList(InputAdditionalPrizeType),
    },
  }),
});

export default Type;
