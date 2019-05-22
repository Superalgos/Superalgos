import {
  GraphQLObjectType,
} from 'graphql';

import TeamsQuery from './Teams';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    TeamsQuery
  ),
});

export default RootQuery;
