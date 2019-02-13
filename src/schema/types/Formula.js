import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const FormulaType = new GraphQLObjectType({
  name: 'Formula',
  description: 'For now it\'s simplay a named field',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

export default FormulaType;
