import {
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
} from 'graphql';
import InputConditionType from './Condition';

const Type = new GraphQLInputObjectType({
  name: 'SituationInput',
  description: 'Payload for situation input',
  fields: () => ({
    name: { type: GraphQLString },
    conditions: { type: new GraphQLList(InputConditionType) },
  }),
});

export default Type;
