import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import {
  FormulaType,
  PlotterType,
  RuleType,
  ParticipantType,
  PrizeType,
  InvitationType,
  PresentationType,
} from './index';
import EventStateEnumType from './enum/EventState';

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: 'Everything you need to know about an event',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    subtitle: { type: GraphQLString },
    hostId: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    finishDatetime: { type: GraphQLInt },
    state: { type: EventStateEnumType },
    rules: {
      type: new GraphQLList(RuleType),
      resolve(parent) {
        return parent.rules;
      },
    },
    prizes: {
      type: new GraphQLList(PrizeType),
      resolve(parent) {
        return parent.prizes;
      },
    },
    participants: {
      type: new GraphQLList(ParticipantType),
      resolve(parent) {
        return parent.participants;
      },
    },
    invitations: {
      type: new GraphQLList(InvitationType),
      resolve(parent) {
        return parent.invitations;
      },
    },
    presentation: {
      type: PresentationType,
      resolve(parent) {
        return parent.presentation;
      },
    },
    formula: {
      type: FormulaType,
      resolve(parent) {
        return parent.formulaId;
      },
    },
    plotter: {
      type: PlotterType,
      resolve(parent) {
        return parent.plotterId;
      },
    },
  }),
});

export default EventType;
