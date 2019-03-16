import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLObjectType({
  name: 'Condition',
  description: 'Condition definition',
  fields: () => ({
    name: { type: GraphQLString },
    code: { type: GraphQLString },
  }),
});

export default Type;
