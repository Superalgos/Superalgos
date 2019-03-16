import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputSituationType from './Situation';
import InputPhaseType from './Phase';

const Type = new GraphQLInputObjectType({
  name: 'SubStrategyInput',
  description: 'Payload for subStrategy input',
  fields: () => ({
    name: { type: GraphQLString },
    entryPoint: {
      situations: { type: new GraphQLList(InputSituationType) },
    },
    exitPoint: {
      situations: { type: new GraphQLList(InputSituationType) },
    },
    sellPoint: {
      situations: { type: new GraphQLList(InputSituationType) },
    },
    buyPoint: {
      situations: { type: new GraphQLList(InputSituationType) },
    },
    stopLoss: {
      phases: { type: new GraphQLList(InputPhaseType) },
    },
    buyOrder: {
      phases: { type: new GraphQLList(InputPhaseType) },
    },
    sellOrder: {
      phases: { type: new GraphQLList(InputPhaseType) },
    },
  }),
});

export default Type;
