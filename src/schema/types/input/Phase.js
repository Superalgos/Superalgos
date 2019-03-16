import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import { SituationInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'PhaseInput',
  description: 'Payload for phase input',
  fields: () => ({
    name: { type: GraphQLString },
    code: { type: GraphQLString },
    situations: { type: new GraphQLList(SituationInputType) },
  }),
});

export default Type;
