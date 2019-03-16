import {
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'ConditionInput',
  description: 'Payload for condition input',
  fields: () => ({
    name: GraphQLString,
    code: GraphQLString,
  }),
});

export default Type;
