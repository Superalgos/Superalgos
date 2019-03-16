import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import {
  SituationType,
  PhaseType,
} from './index';

const SubStrategyType = new GraphQLObjectType({
  name: 'SubStrategy',
  description: 'SubStrategy composing a strategy',
  fields: () => ({
    name: { type: GraphQLString },
    entryPoint: {
      situations: {
        type: new GraphQLList(SituationType),
        resolve(parent) {
          return parent.situations;
        },
      },
    },
    exitPoint: {
      situations: {
        type: new GraphQLList(SituationType),
        resolve(parent) {
          return parent.situations;
        },
      },
    },
    sellPoint: {
      situations: {
        type: new GraphQLList(SituationType),
        resolve(parent) {
          return parent.situations;
        },
      },
    },
    buyPoint: {
      situations: {
        type: new GraphQLList(SituationType),
        resolve(parent) {
          return parent.situations;
        },
      },
    },
    stopLoss: {
      phases: {
        type: new GraphQLList(PhaseType),
        resolve(parent) {
          return parent.phases;
        },
      },
    },
    buyOrder: {
      phases: {
        type: new GraphQLList(PhaseType),
        resolve(parent) {
          return parent.phases;
        },
      },
    },
    sellOrder: {
      phases: {
        type: new GraphQLList(PhaseType),
        resolve(parent) {
          return parent.phases;
        },
      },
    },
  }),
});

export default SubStrategyType;
