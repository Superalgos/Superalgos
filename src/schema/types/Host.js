import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const HostType = new GraphQLObjectType({
  name: 'Host',
  fields: () => ({
    url: { type: GraphQLString },
    storage: { type: GraphQLString },
    container: { type: GraphQLString },
    accessKey: { type: GraphQLString },
    ownerKey: { type: GraphQLString }
  }),
});

export default HostType;
