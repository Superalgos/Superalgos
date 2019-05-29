import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const DataRangeType = new GraphQLObjectType({
  name: 'DataRange',
  fields: () => ({
    filePath: { type: GraphQLString },
    fileName: { type: GraphQLString }
  }),
});

export default DataRangeType;
