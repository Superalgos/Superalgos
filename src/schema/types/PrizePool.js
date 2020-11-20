import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const PrizePoolType = new GraphQLObjectType({
  name: 'PrizePool',
  description: 'PrizePool',
  fields: () => ({
    amount: { type: GraphQLInt },
    asset: { type: GraphQLString },
  }),
});

export default PrizePoolType;
