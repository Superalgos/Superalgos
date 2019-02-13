import {
  GraphQLObjectType,
} from 'graphql';

import EventsQuery from './Events';
import EventsByHostQuery from './EventsByHost';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    EventsQuery,
    EventsByHostQuery,
  ),
});

export default RootQuery;
