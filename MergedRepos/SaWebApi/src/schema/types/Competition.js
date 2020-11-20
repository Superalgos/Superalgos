import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { PlotterReferenceType } from './index';

const CompetitionType = new GraphQLObjectType({
  name: 'Competition',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLString },
    finishDatetime: { type: GraphQLString },
    formula: { type: GraphQLString },
    plotter: {
      type: PlotterReferenceType,
      resolve(parent) {
        return parent.plotter;
      }
    },
    rules:{ type: new GraphQLList(GraphQLString) },
    prizes:{ type: new GraphQLList(GraphQLString) },
    participants:{ type: new GraphQLList(GraphQLString) },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString }
  }),
});

export default CompetitionType;
