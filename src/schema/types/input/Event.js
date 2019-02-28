import {
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputPrizeType from './Prize';
import InputPresentationType from './Presentation';
import InputRuleType from './Rule';

const Type = new GraphQLInputObjectType({
  name: 'EventInput',
  description: 'Payload for event input',
  fields: () => ({
    title: { type: GraphQLString },
    subtitle: { type: GraphQLString },
    hostId: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    endDatetime: { type: GraphQLInt },
    formulaId: { type: GraphQLString },
    plotterId: { type: GraphQLString },
    prizes: { type: new GraphQLList(InputPrizeType) },
    rules: { type: new GraphQLList(InputRuleType) },
    presentation: { type: InputPresentationType },
  }),
});

export default Type;
