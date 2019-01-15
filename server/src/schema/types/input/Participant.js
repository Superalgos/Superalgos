import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ParticipantInput',
  description: 'Payload for formula input',
  fields: () => ({
    teamId: { type: new GraphQLNonNull(GraphQLString) },
    botId: { type: GraphQLString },
    releaseId: { type: GraphQLString },
  }),
});

export default Type;
