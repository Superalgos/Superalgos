import {
  GraphQLObjectType,
} from 'graphql';

import CalcLogLinkIDQuery from './CalcLogLinkID';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    CalcLogLinkIDQuery,
  ),
});

export default RootQuery;
