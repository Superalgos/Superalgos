import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputPrizeType from './Prize';

const Type = new GraphQLInputObjectType({
  name: 'EventInput',
  description: 'Payload for event input',
  fields: () => ({
    name: { type: GraphQLString },
    formulaId: { type: GraphQLString },
    plotterId: { type: GraphQLString },
    prizes: { type: new GraphQLList(InputPrizeType) },
  }),
});

export default Type;
