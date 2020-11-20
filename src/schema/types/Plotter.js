import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  description: 'Will soon change in order to use contained plotter objects',
  fields: () => ({
    id: { type: GraphQLID },
    ownerId: { type: GraphQLString },
    isTemplate: { type: GraphQLBoolean },
    name: { type: GraphQLString },
    host: { type: GraphQLString },
    repo: { type: GraphQLString },
    moduleName: { type: GraphQLString },
  }),
});

export default PlotterType;
