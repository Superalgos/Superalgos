import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'FileInput',
  description: 'Payload for file input.',
  fields: () => ({
    container: { type: new GraphQLNonNull(GraphQLString) },
    filePath: { type: new GraphQLNonNull(GraphQLString) },
    storage: { type: new GraphQLNonNull(GraphQLString) },
    accessKey: { type: GraphQLString },
    fileContent: { type: GraphQLString }
  }),
});

export default Type;
