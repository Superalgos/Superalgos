import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

const AdditionalPrizeType = new GraphQLObjectType({
  name: 'AdditionalPrize',
  description: 'Non algo complementary prize',
  fields: () => ({
    condition: { type: GraphQLString },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    asset: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default AdditionalPrizeType;
