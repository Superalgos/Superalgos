import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { BotType, HostType } from './index';

const TeamType = new GraphQLObjectType({
  name: 'Team',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    host: {
      type: HostType,
      resolve(parent) {
        return parent.host;
      }
    },
    bots: {
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

export default TeamType;
