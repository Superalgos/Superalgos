import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'RuleInput',
  description: 'Payload for rule input',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
  }),
});

export default Type;
