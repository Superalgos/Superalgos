import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'RuleInput',
  description: 'Payload for rule input',
  fields: () => ({
    position: { type: GraphQLInt },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
  }),
});

export default Type;
