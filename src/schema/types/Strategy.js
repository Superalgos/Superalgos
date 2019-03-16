import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import {
  SubStrategyType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'Strategy',
  description: 'Everything you need to know about a strategy',
  fields: () => ({
    id: GraphQLID,
    fbId: GraphQLString,
    subStrategies: {
      type: new GraphQLList(SubStrategyType),
      resolve(parent) {
        return parent.subStrategies;
      },
    },
  }),
});

export default Type;
