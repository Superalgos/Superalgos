import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import { SubStrategyInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'StrategyInput',
  description: 'Payload for strategy input',
  fields: () => ({
    subStrategies: new GraphQLList(SubStrategyInputType),
  }),
});

export default Type;
