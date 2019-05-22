import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLList
} from 'graphql';

import { BotInputType, HostInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'TeamInput',
  description: 'Payload for team input',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    host: { type: HostInputType },
    bots: { type: new GraphQLNonNull(new GraphQLList(BotInputType)) },
    plotters: { type: new GraphQLList(BotInputType) }
  }),
});

export default Type;
