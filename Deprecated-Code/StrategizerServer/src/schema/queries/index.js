import {
  GraphQLObjectType,
} from 'graphql';

import TradingSystemByFbQuery from './TradingSystemByFB';
import TradingSystemByIdQuery from './TradingSystemById';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    TradingSystemByFbQuery,
    TradingSystemByIdQuery,
  ),
});

export default RootQuery;
