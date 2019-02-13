import {
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'SubPrizeInput',
  description: 'Payload prize input',
  fields: () => ({
    condition: { type: GraphQLString },
  }),
});

export default Type;
