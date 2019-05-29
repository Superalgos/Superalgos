import {
  GraphQLObjectType,
} from 'graphql';

import EcosystemQuery from './Ecosystem';
import FileContentQuery from './FileContent';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    EcosystemQuery,
    FileContentQuery
  ),
});

export default RootQuery;
