import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
} from 'graphql';
import { AdditionalPrizeType } from './index';

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  fields: () => ({
    rank: { type: GraphQLInt },
    amount: { type: GraphQLInt },
    additional: {
      type: new GraphQLList(AdditionalPrizeType),
      resolve(parent) {
        return parent.additional;
      },
    },
  }),
});

export default PrizeType;
