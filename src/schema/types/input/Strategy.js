import {
  GraphQLString,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const Type = new GraphQLInputObjectType({
  name: 'SubStrategyInput',
  description: 'Payload for subStrategy input',
  fields: () => ({
    active: { type: GraphQLBoolean },
    name: { type: GraphQLString },
    filter: { type: GraphQLJSON },
    triggerStage: { type: GraphQLJSON },
    openStage: { type: GraphQLJSON },
    manageStage: { type: GraphQLJSON },
    closeStage: { type: GraphQLJSON },
  }),
});

export default Type;
