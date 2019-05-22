import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const BotType = new GraphQLObjectType({
  name: 'Bot',
  fields: () => ({
    repo: { type: GraphQLString },
    configFile: { type: GraphQLString }
  }),
});

export default BotType;
