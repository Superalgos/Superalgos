import {
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputFormulaType from './Formula';
import InputPlotterType from './Plotter';
import InputPrizeType from './Prize';
import InputParticipantType from './Participant';
import InputRuleType from './Rule';

const Type = new GraphQLInputObjectType({
  name: 'EventInput',
  description: 'Payload for event input',
  fields: () => ({
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    finishDatetime: { type: GraphQLInt },
    formulaId: { type: GraphQLString },
    formula: { type: InputFormulaType },
    plotterId: { type: GraphQLString },
    plotter: { type: InputPlotterType },
    prizes: { type: new GraphQLList(InputPrizeType) },
    participants: { type: new GraphQLList(InputParticipantType) },
    rules: { type: new GraphQLList(InputRuleType) },
  }),
});

export default Type;
