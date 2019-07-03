import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'PlotterInput',
  description: 'Payload for plotter input.',
  fields: () => ({
    devTeam: { type: new GraphQLNonNull(GraphQLString) },
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    moduleName: { type: new GraphQLNonNull(GraphQLString) }
  }),
});

export default Type;
