import {
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ParticipantInput',
  description: 'Payload for formula input',
  fields: () => ({
    participantId: { type: GraphQLString },
    botId: { type: GraphQLString },
    releaseId: { type: GraphQLString },
  }),
});

export default Type;
