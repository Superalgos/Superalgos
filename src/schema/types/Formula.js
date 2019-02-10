import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

const FormulaType = new GraphQLObjectType({
  name: 'Formula',
  description: 'For now it\'s simply a named field',
  fields: () => ({
    id: { type: GraphQLID },
    ownerId: { type: GraphQLString },
    isTemplate: { type: GraphQLBoolean },
    name: { type: GraphQLString },
  }),
});

export default FormulaType;
