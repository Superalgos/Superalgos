import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'PrizePoolInput',
  description: 'Payload for formula input',
  fields: () => ({
    amount: { type: GraphQLInt },
    asset: { type: GraphQLString },
  }),
});

export default Type;
