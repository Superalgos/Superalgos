import {
  GraphQLObjectType,
} from 'graphql';
import {
  PrizeConditionType,
  PrizePoolType,
} from './index';

const PrizeType = new GraphQLObjectType({
  name: 'Prize',
  description: 'Prize, by default in algos',
  fields: () => ({
    condition: { type: PrizeConditionType },
    pool: { type: PrizePoolType },
  }),
});

export default PrizeType;
