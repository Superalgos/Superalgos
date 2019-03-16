import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLObjectType({
  name: 'Condition',
  description: 'Condition definition',
  fields: () => ({
    name: GraphQLString,
    code: GraphQLString,
  }),
});

export default Type;
