import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'AdditionalPrizeInput',
  description: 'Payload for formula input',
  fields: () => ({
    condition: { type: GraphQLString },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    asset: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default Type;
