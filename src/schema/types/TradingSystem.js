import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from 'graphql';
import GraphQLJSON from './GraphQLJSONObject';

const Type = new GraphQLObjectType({
  name: 'TradingSystem',
  description: 'Everything you need to know about a trading system',
  fields: () => ({
    id: { type: GraphQLID },
    fbSlug: { type: GraphQLString },
    data: { type: GraphQLJSON },
  }),
});

export default Type;
