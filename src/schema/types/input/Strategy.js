import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import SubStrategyType from './SubStrategy';

const Type = new GraphQLInputObjectType({
  name: 'StrategyInput',
  description: 'Payload for strategy input',
  fields: () => ({
    subStrategies: { type: new GraphQLList(SubStrategyType) },
  }),
});

export default Type;
