import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ParticipantInput',
  description: 'Payload for formula input',
  fields: () => ({
    participantId: { type: new GraphQLNonNull(GraphQLString) },
    keyId: { type: new GraphQLNonNull(GraphQLString) },
    botId: { type: new GraphQLNonNull(GraphQLString) },
    releaseId: { type: GraphQLString },
  }),
});

export default Type;
