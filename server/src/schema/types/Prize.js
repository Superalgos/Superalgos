import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import { AdditionalPrizeType } from './index';

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  description: 'Prize, by default in algos',
  fields: () => ({
    rank: { type: new GraphQLNonNull(GraphQLInt) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    additional: {
      type: new GraphQLList(AdditionalPrizeType),
      resolve(parent) {
        return parent.additional;
      },
    },
  }),
});

export default PrizeType;
