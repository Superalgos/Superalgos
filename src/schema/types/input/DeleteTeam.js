import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull
} from 'graphql';

import { HostInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'DeleteTeamInput',
  description: 'Payload for team input',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    host: { type: HostInputType }
  }),
});

export default Type;
