import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import { StrategyInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'TradingSystemInput',
  description: 'Payload for trading system  input',
  fields: () => ({
    strategies: { type: new GraphQLList(StrategyInputType) },
  }),
});

export default Type;
