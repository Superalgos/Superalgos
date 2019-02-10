import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import {
  InviterType,
} from './index';

const InvitationType = new GraphQLObjectType({
  name: 'Invitation',
  description: 'Invitation',
  fields: () => ({
    inviteeId: { type: GraphQLString },
    acceptedDate: { type: GraphQLInt },
    refusedDate: { type: GraphQLInt },
    by: { type: InviterType },
  }),
});

export default InvitationType;
