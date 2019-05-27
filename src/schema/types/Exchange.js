import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const ExchangeType = new GraphQLObjectType({
  name: 'Exchange',
  fields: () => ({
    name: { type: GraphQLString }
  }),
});

export default ExchangeType;
