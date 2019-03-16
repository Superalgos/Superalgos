import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const ConditionType = new GraphQLObjectType({
  name: 'Condition',
  description: 'Condition definition',
  fields: () => ({
    name: { type: GraphQLString },
    code: { type: GraphQLString },
  }),
});

export default ConditionType;
