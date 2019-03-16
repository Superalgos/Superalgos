import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputSituationType from './Situation';

const Type = new GraphQLInputObjectType({
  name: 'PhaseInput',
  description: 'Payload for phase input',
  fields: () => ({
    name: { type: GraphQLString },
    code: { type: GraphQLString },
    situations: { type: new GraphQLList(InputSituationType) },
  }),
});

export default Type;
