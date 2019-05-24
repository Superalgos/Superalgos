import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { BotType } from './index';

const EventHostType = new GraphQLObjectType({
  name: 'EventHost',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    host: { type: GraphQLString },
    container: { type: GraphQLString },
    accessKey: { type: GraphQLString },
    competitions: {
      type: new GraphQLList(BotType),
      resolve(parent) {
        return parent.bots;
      }
    },
    plotters: {
      type: new GraphQLList(BotType),
      resolve(parent) {
        return parent.bots;
      }
    }
  }),
});

export default EventHostType;
