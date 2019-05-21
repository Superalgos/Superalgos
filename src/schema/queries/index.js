import {
  GraphQLObjectType,
} from 'graphql';

import TradingSystemByFbQuery from './TradingSystemByFB';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    TradingSystemByFbQuery,
  ),
});

export default RootQuery;
