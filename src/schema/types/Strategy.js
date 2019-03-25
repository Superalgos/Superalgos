import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {
  SubStrategyType,
} from './index';

const Type = new GraphQLObjectType({
  name: 'Strategy',
  description: 'Everything you need to know about a strategy',
  fields: () => ({
    id: { type: GraphQLID },
    fbSlug: { type: GraphQLString },
    subStrategies: {
      args: { actifOnly: { type: GraphQLBoolean } },
      type: new GraphQLList(SubStrategyType),
      resolve(parent, { actifOnly }) {
        if (actifOnly) {
          return parent.subStrategies.filter(subStrategy => subStrategy.actif);
        }
        return parent.subStrategies;
      },
    },
  }),
});

export default Type;
