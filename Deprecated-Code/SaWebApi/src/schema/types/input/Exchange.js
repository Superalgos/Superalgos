import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ExchangeInput',
  description: 'Payload for exchange input.',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) }
  }),
});

export default Type;
