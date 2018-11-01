import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

const FormulaType = new GraphQLObjectType({
  name: 'Formula',
  fields: () => ({
    id: { type: GraphQLString },
    ownerId: { type: GraphQLString },
    isTemplate: { type: GraphQLBoolean },
    name: { type: GraphQLString },
  }),
});

export default FormulaType;
