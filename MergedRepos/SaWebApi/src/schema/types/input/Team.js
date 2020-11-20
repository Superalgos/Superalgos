import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql';

import { BotInputType, HostInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'TeamInput',
  description: 'Payload for team input',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    host: { type: HostInputType },
    bot: { type: new GraphQLNonNull(BotInputType) },
    plotter: { type: BotInputType }
  }),
});

export default Type;
