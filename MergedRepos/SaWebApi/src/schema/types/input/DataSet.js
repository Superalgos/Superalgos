import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'DataSetInput',
  description: 'Payload for data set input.',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: new GraphQLNonNull(GraphQLString) },
    filePath: { type: new GraphQLNonNull(GraphQLString) },
    fileName: { type: new GraphQLNonNull(GraphQLString) },
    validPeriods: { type: new GraphQLList(GraphQLString) }
  }),
});

export default Type;
