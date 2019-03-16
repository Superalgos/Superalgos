import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import {
  SituationType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'Phase',
  code: 'Phase',
  description: 'Phase definition',
  fields: () => ({
    name: { type: GraphQLString },
    situations: {
      type: new GraphQLList(SituationType),
      resolve(parent) {
        return parent.situations;
      },
    },
  }),
});

export default Type;
