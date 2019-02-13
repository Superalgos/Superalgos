import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { SubPrizeType } from './index';

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  description: 'Prize, by default in algos',
  fields: () => ({
    rank: { type: new GraphQLNonNull(GraphQLString) },
    subPrize: {
      type: new GraphQLList(SubPrizeType),
      resolve(parent) {
        return parent.subPrize;
      },
    },
  }),
});

export default PrizeType;
