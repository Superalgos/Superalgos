import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  fields: () => ({
    teamId: { type: GraphQLString },
    botId: { type: GraphQLString },
    releaseId: { type: GraphQLString },
  }),
});

export default ParticipantType;
