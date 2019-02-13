import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import {
  FormulaType,
  PlotterType,
  PrizeType,
} from './index';
import EventStateEnumType from './enum/EventState';

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: 'Everything you need to know about an event',
  fields: () => ({
    id: { type: GraphQLID },
    state: { type: EventStateEnumType },
    name: { type: GraphQLString },
    hostId: { type: GraphQLString },
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
    prizes: {
      type: new GraphQLList(PrizeType),
      resolve(parent) {
        return parent.prizes;
      },
    },
  }),
});

export default EventType;
