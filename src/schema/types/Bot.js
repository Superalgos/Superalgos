import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const BotType = new GraphQLObjectType({
  name: 'Bot',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString }
  }),
});

export default BotType;
