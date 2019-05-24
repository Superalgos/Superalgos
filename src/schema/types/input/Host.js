import {
  GraphQLInputObjectType,
  GraphQLString
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'HostInput',
  description: 'Payload for host input.',
  fields: () => ({
    url: { type: GraphQLString },
    storage: { type: GraphQLString },
    container: { type: GraphQLString },
    accessKey: { type: GraphQLString }
  }),
});

export default Type;
