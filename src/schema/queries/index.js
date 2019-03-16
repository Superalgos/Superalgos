import {
  GraphQLObjectType,
} from 'graphql';

import StrategyByFbQuery from './StrategyByFB';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    StrategyByFbQuery,
  ),
});

export default RootQuery;
