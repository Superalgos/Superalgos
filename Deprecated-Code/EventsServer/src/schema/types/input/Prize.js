import {
  GraphQLInputObjectType,
} from 'graphql';
import InputPrizeConditionType from './PrizeCondition';
import InputPrizePoolType from './PrizePool';

const Type = new GraphQLInputObjectType({
  name: 'PrizeInput',
  description: 'Payload for formula input',
  fields: () => ({
    condition: { type: InputPrizeConditionType },
    pool: { type: InputPrizePoolType },
  }),
});

export default Type;
