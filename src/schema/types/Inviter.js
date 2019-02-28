import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

const InviterType = new GraphQLObjectType({
  name: 'Inviter',
  description: 'Inviter',
  fields: () => ({
    date: { type: GraphQLInt },
    inviterId: { type: GraphQLString },
  }),
});

export default InviterType;
