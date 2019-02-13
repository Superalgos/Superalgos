import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  description: 'Will soon change in order to use contained plotter objects',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

export default PlotterType;
