import {
  GraphQLInputObjectType,
  GraphQLString
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'BotInput',
  description: 'Payload for bot input.',
  fields: () => ({
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString }
  }),
});

export default Type;
