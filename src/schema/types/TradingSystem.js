import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {
  StrategyType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'TradingSystem',
  description: 'Everything you need to know about a trading system',
  fields: () => ({
    id: { type: GraphQLID },
    fbSlug: { type: GraphQLString },
    strategies: {
      args: { activeOnly: { type: GraphQLBoolean } },
      type: new GraphQLList(StrategyType),
      resolve(parent, { activeOnly }) {
        if (activeOnly) {
          return parent.strategies.filter(strategy => strategy.active);
        }
        return parent.strategies;
      },
    },
  }),
});

export default Type;
