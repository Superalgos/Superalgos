import {
  GraphQLObjectType,
  GraphQLList,
} from 'graphql';
import {
  SituationType,
  PhaseType,
} from './index';

// SituationBased

const EntryPointType = new GraphQLObjectType({
  name: 'EntryPoint',
  description: 'EntryPoint definition',
  fields: () => ({
    situations: {
      type: new GraphQLList(SituationType),
      resolve(parent) {
        return parent.situations;
      },
    },
  }),
});

const ExitPointType = new GraphQLObjectType({
  name: 'ExitPoint',
  description: 'ExitPoint definition',
  fields: () => ({
    situations: {
      type: new GraphQLList(SituationType),
      resolve(parent) {
        return parent.situations;
      },
    },
  }),
});

const SellPointType = new GraphQLObjectType({
  name: 'SellPoint',
  description: 'SellPoint definition',
  fields: () => ({
    situations: {
      type: new GraphQLList(SituationType),
      resolve(parent) {
        return parent.situations;
      },
    },
  }),
});

const BuyPointType = new GraphQLObjectType({
  name: 'BuyPoint',
  description: 'BuyPoint definition',
  fields: () => ({
    situations: {
      type: new GraphQLList(SituationType),
      resolve(parent) {
        return parent.situations;
      },
    },
  }),
});

// PhaseBased

const StopLossType = new GraphQLObjectType({
  name: 'StopLoss',
  description: 'StopLoss definition',
  fields: () => ({
    phases: {
      type: new GraphQLList(PhaseType),
      resolve(parent) {
        return parent.phases;
      },
    },
  }),
});

const BuyOrderType = new GraphQLObjectType({
  name: 'BuyOrder',
  description: 'BuyOrder definition',
  fields: () => ({
    phases: {
      type: new GraphQLList(PhaseType),
      resolve(parent) {
        return parent.phases;
      },
    },
  }),
});

const SellOrderType = new GraphQLObjectType({
  name: 'SellOrder',
  description: 'SellOrder definition',
  fields: () => ({
    phases: {
      type: new GraphQLList(PhaseType),
      resolve(parent) {
        return parent.phases;
      },
    },
  }),
});

export {
  EntryPointType,
  ExitPointType,
  SellPointType,
  BuyPointType,
  StopLossType,
  BuyOrderType,
  SellOrderType,
};
