import {
  GraphQLObjectType,
} from 'graphql';

import CreateTradingSystemMutation from './CreateTradingSystem';
import EditTradingSystemMutation from './EditTradingSystem';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    CreateTradingSystemMutation,
    EditTradingSystemMutation,
  ),
});

export default Mutation;
