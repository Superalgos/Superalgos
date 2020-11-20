import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql'

import { PanelType } from './index'

const ModuleType = new GraphQLObjectType({
  name: 'Module',
  fields: () => ({
    codeName: { type: GraphQLString },
    moduleName: { type: GraphQLString },
    description: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    panels: {
      type: new GraphQLList(PanelType),
      resolve(parent) {
        return parent.panels;
      }
     }
  }),
});

export default ModuleType;
