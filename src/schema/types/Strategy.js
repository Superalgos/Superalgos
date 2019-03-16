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
  name: 'Event',
  description: 'Everything you need to know about an event',
  fields: () => ({
    id: { type: GraphQLID },
    fbId: { type: GraphQLString },
    subStrategies: {
      type: new GraphQLList(SubStrategyType),
      resolve(parent) {
        return parent.subStrategies;
      },
    },
  }),
});

export default Type;
