import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const PlotterReferenceType = new GraphQLObjectType({
  name: 'PlotterReference',
  fields: () => ({
    codeName: { type: GraphQLString },
    host: { type: GraphQLString },
    devTeam: { type: GraphQLString },
    moduleName: { type: GraphQLString },
    repo: { type: GraphQLString }
  }),
});

export default PlotterReferenceType;
