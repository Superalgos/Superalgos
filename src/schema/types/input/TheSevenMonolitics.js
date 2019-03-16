import {
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import { SituationInputType, PhaseInputType } from './index';

// SituationBased

const EntryPointInputType = new GraphQLInputObjectType({
  name: 'EntryPointInput',
  description: 'Payload for entryPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(SituationInputType) },
  }),
});

const ExitPointInputType = new GraphQLInputObjectType({
  name: 'ExitPointInput',
  description: 'Payload for exitPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(SituationInputType) },
  }),
});

const SellPointInputType = new GraphQLInputObjectType({
  name: 'SellPointInput',
  description: 'Payload for sellPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(SituationInputType) },
  }),
});

const BuyPointInputType = new GraphQLInputObjectType({
  name: 'BuyPointInput',
  description: 'Payload for buyPoint input',
  fields: () => ({
    situations: { type: new GraphQLList(SituationInputType) },
  }),
});

// PhaseBased

const StopLossInputType = new GraphQLInputObjectType({
  name: 'StopLossTypeInput',
  description: 'Payload for stopLossType input',
  fields: () => ({
    situations: { type: new GraphQLList(PhaseInputType) },
  }),
});

const BuyOrderInputType = new GraphQLInputObjectType({
  name: 'BuyOrderTypeInput',
  description: 'Payload for buyOrderType input',
  fields: () => ({
    situations: { type: new GraphQLList(PhaseInputType) },
  }),
});

const SellOrderInputType = new GraphQLInputObjectType({
  name: 'SellOrderTypeInput',
  description: 'Payload for sellOrderType input',
  fields: () => ({
    situations: { type: new GraphQLList(PhaseInputType) },
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
