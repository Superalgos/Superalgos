import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  description: 'Informations about the participant of an event',
  fields: () => ({
    teamId: { type: GraphQLString },
    botId: { type: GraphQLString },
    releaseId: { type: GraphQLString },
  }),
});

export default ParticipantType;
