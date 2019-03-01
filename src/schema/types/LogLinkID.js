import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} from 'graphql';


const LogLinkIDType = new GraphQLObjectType({
  name: 'LogLinkID',
  description: 'Generate de LogLinkID',
  fields: () => ({
    seedID: { type: GraphQLID },
    value: { type: GraphQLString },
  }),
});

export default LogLinkIDType;
