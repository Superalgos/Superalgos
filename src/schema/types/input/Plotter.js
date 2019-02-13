import {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'PlotterInput',
  description: 'Payload for plotter input',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export default Type;
