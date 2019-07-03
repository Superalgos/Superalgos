import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'BotInput',
  description: 'Payload for bot input.',
  fields: () => ({
    devTeam: { type: new GraphQLNonNull(GraphQLString) },
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    productCodeName: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: GraphQLString },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString },
    cloneId: { type: GraphQLString },
    validPeriod: { type: GraphQLString },
  }),
});

export default Type;
