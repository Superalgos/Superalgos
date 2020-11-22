import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { ProductType } from './index'

const BotType = new GraphQLObjectType({
  name: 'Bot',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    type: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString },
    cloneId: { type: GraphQLString },
    products: {
      type: new GraphQLList(ProductType),
      resolve(parent) {
        return parent.products;
      }
    },
  }),
});

export default BotType;
