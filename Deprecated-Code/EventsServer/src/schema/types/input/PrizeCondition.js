import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'PrizeConditionInput',
  description: 'Payload for formula input',
  fields: () => ({
    from: { type: GraphQLInt },
    to: { type: GraphQLInt },
    additional: { type: GraphQLString },
  }),
});

export default Type;
