import {
  GraphQLSchema,
} from 'graphql';

import RootQuery from './queries';

const Schema = new GraphQLSchema({
  query: RootQuery,
});

export default Schema;
