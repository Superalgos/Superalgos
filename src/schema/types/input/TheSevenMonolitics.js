import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputSituationType from './Situation';
import InputPhaseType from './Phase';

// SituationBased

const EntryPointInputType = new GraphQLInputObjectType({
  name: 'EntryPointInput',
  description: 'Payload for entryPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(InputSituationType) },
  }),
});

const ExitPointInputType = new GraphQLInputObjectType({
  name: 'ExitPointInput',
  description: 'Payload for exitPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(InputSituationType) },
  }),
});

const SellPointInputType = new GraphQLInputObjectType({
  name: 'SellPointInput',
  description: 'Payload for sellPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(InputSituationType) },
  }),
});

const BuyPointInputType = new GraphQLInputObjectType({
  name: 'BuyPointInput',
  description: 'Payload for buyPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(InputSituationType) },
  }),
});

// PhaseBased

const StopLossInputType = new GraphQLInputObjectType({
  name: 'StopLossTypeInput',
  description: 'Payload for stopLossType input',
  fields: () => ({
    situations: { type: new GraphQLList(InputPhaseType) },
  }),
});

const BuyOrderInputType = new GraphQLInputObjectType({
  name: 'BuyOrderTypeInput',
  description: 'Payload for buyOrderType input',
  fields: () => ({
    situations: { type: new GraphQLList(InputPhaseType) },
  }),
});

const SellOrderInputType = new GraphQLInputObjectType({
  name: 'SellOrderTypeInput',
  description: 'Payload for sellOrderType input',
  fields: () => ({
    situations: { type: new GraphQLList(InputPhaseType) },
  }),
});

export {
  EntryPointInputType,
  ExitPointInputType,
  SellPointInputType,
  BuyPointInputType,
  StopLossInputType,
  BuyOrderInputType,
  SellOrderInputType,
};
