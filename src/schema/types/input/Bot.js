import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'BotInput',
  description: 'Payload for bot input.',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString },
    cloneId: { type: GraphQLString }
  }),
});

export default Type;
