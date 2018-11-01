import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  fields: () => ({
    id: { type: GraphQLString },
    ownerId: { type: GraphQLString },
    isTemplate: { type: GraphQLBoolean },
    name: { type: GraphQLString },
    host: { type: GraphQLString },
    repo: { type: GraphQLString },
    moduleName: { type: GraphQLString },
  }),
});

export default PlotterType;
