import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const PrizeConditionType = new GraphQLObjectType({
  name: 'PrizeCondition',
  description: 'PrizeCondition',
  fields: () => ({
    from: { type: GraphQLInt },
    to: { type: GraphQLInt },
    additional: { type: GraphQLString },
  }),
});

export default PrizeConditionType;
