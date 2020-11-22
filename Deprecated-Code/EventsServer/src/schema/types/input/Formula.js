import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'FormulaInput',
  description: 'Payload for formula input',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default Type;
