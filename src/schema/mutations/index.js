import {
  GraphQLObjectType,
} from 'graphql';

import CreateStrategyMutation from './CreateStrategy';
import EditStrategyMutation from './EditStrategy';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    CreateStrategyMutation,
    EditStrategyMutation,
  ),
});

export default Mutation;
