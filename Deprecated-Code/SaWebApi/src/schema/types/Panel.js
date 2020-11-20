import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

const PanelType = new GraphQLObjectType({
  name: 'Panel',
  fields: () => ({
    codeName: { type: GraphQLString },
    moduleName: { type: GraphQLString },
    event: { type: GraphQLString }
  }),
});

export default PanelType;
