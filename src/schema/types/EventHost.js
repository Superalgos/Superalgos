import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { CompetitionType, PlotterType, HostType } from './index';

const EventHostType = new GraphQLObjectType({
  name: 'EventHost',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    host: {
      type: HostType,
      resolve(parent) {
        return parent.host;
      }
    },
    container: { type: GraphQLString },
    accessKey: { type: GraphQLString },
    competitions: {
      type: new GraphQLList(CompetitionType),
      resolve(parent) {
        return parent.competitions;
      }
    },
    plotters: {
      type: new GraphQLList(PlotterType),
      resolve(parent) {
        return parent.plotters;
      }
    }
  }),
});

export default EventHostType;
