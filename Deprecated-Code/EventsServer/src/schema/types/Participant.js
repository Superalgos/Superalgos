import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import ParticipantStateEnumType from './enum/ParticipantState';

const ParticipantType = new GraphQLObjectType({
  name: 'Participant',
  description: 'Informations about the participant of an event',
  fields: () => ({
    participantId: { type: GraphQLString },
    state: { type: ParticipantStateEnumType },
    operationId: { type: GraphQLString },
  }),
});

export default ParticipantType;
