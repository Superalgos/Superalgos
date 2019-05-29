import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const FileType = new GraphQLObjectType({
  name: 'File',
  fields: () => ({
    container: { type: GraphQLString },
    filePath: { type: GraphQLString },
    storage: { type: GraphQLString },
    accessKey: { type: GraphQLString },
    fileContent: { type: GraphQLString }
  }),
});

export default FileType;
