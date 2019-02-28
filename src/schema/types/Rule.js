import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const RuleType = new GraphQLObjectType({
  name: 'Rule',
  description: 'Textual rules of an event',
  fields: () => ({
    title: { type: GraphQLString },
    description: { type: GraphQLString },
  }),
});

export default RuleType;
