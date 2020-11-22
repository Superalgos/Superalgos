import {
  GraphQLSchema,
} from 'graphql';
import RootQuery from './queries';
import Mutation from './mutations';

const Schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});

export default Schema;
