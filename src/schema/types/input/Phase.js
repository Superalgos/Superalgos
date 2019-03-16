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
    name: GraphQLString,
    code: GraphQLString,
    situations: new GraphQLList(SituationInputType),
  }),
});

export default Type;
