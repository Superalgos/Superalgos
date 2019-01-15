import {
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputPrizeType from './Prize';
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
    plotterId: { type: GraphQLString },
    prizes: { type: new GraphQLList(InputPrizeType) },
    rules: { type: new GraphQLList(InputRuleType) },
  }),
});

export default Type;
