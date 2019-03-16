import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import {
  ConditionType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'Situation',
  description: 'Situation definition',
  fields: () => ({
    name: { type: GraphQLString },
    conditions: {
      type: new GraphQLList(ConditionType),
      resolve(parent) {
        return parent.conditions;
      },
    },
  }),
});

export default Type;
