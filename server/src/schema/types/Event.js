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
} from './index';

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    designator: { type: GraphQLID },
    name: { type: GraphQLString },
    hostId: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    finishDatetime: { type: GraphQLInt },
    formula: {
      type: FormulaType,
      resolve(parent) {
        return parent.formula;
      },
    },
    plotter: {
      type: PlotterType,
      resolve(parent) {
        return parent.plotter;
      },
    },
    rules: {
      type: new GraphQLList(RuleType),
      resolve(parent) {
        return parent.rules;
      },
    },
    participants: {
      type: new GraphQLList(ParticipantType),
      resolve(parent) {
        return parent.participants;
      },
    },
    prizes: {
      type: new GraphQLList(PrizeType),
      resolve(parent) {
        return parent.prizes;
      },
    },
  }),
});

export default EventType;
