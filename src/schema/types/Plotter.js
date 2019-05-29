import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { ModuleType } from './index'

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    host: { type: GraphQLString },
    modules: {
      type: new GraphQLList(ModuleType),
      resolve(parent) {
        return parent.modules;
      }
    },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString }
  }),
});

export default PlotterType;
