import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { HostType } from './index';

const PlotterReferenceType = new GraphQLObjectType({
  name: 'PlotterReference',
  fields: () => ({
    devTeam: { type: GraphQLString },
    codeName: { type: GraphQLString },
    host: {
      type: HostType,
      resolve(parent) {
        return parent.host;
      }
    },
    moduleName: { type: GraphQLString },
    repo: { type: GraphQLString }
  }),
});

export default PlotterReferenceType;
