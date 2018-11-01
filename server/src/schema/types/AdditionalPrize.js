import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

const AdditionalPrizeType = new GraphQLObjectType({
  name: 'OtherPrize',
  fields: () => ({
    condition: { type: GraphQLString },
    amount: { type: GraphQLInt },
    asset: { type: GraphQLString },
  }),
});

export default AdditionalPrizeType;
