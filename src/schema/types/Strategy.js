import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

const Type = new GraphQLObjectType({
  name: 'Strategy',
  description: 'Strategy composing a trading system',
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
