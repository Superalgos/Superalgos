import {
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ConditionInput',
  description: 'Payload for condition input',
  fields: () => ({
    name: { type: GraphQLString },
    code: { type: GraphQLString },
  }),
});

export default Type;
