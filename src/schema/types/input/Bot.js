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
    productCodeName: { type: GraphQLString },
    devTeam: { type: GraphQLString},
    displayName: { type: GraphQLString },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString },
    cloneId: { type: GraphQLString },
    validPeriod: { type: GraphQLString },
  }),
});

export default Type;
