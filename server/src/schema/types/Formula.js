import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

const FormulaType = new GraphQLObjectType({
  name: 'Formula',
  description: 'For now it\'s simplay a named field',
  fields: () => ({
    id: { type: GraphQLString },
    ownerId: { type: GraphQLString },
    isTemplate: { type: GraphQLBoolean },
    name: { type: GraphQLString },
  }),
});

export default FormulaType;
