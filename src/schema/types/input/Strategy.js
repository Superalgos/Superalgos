import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import SubStrategyType from './SubStrategy';

const Type = new GraphQLInputObjectType({
  name: 'EventInput',
  description: 'Payload for event input',
  fields: () => ({
    subStrategies: { type: new GraphQLList(SubStrategyType) },
  }),
});

export default Type;
