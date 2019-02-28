import {
  GraphQLSchema,
} from 'graphql';

import Mutation from './mutations';
import RootQuery from './queries';

const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

export default Schema;
