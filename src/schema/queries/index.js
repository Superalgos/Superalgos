import {
  GraphQLObjectType,
} from 'graphql';

import EcosystemQuery from './Ecosystem';
import FileContentQuery from './FileContent';
import PlotterCodeQuery from './PlotterCode';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    EcosystemQuery,
    FileContentQuery,
    PlotterCodeQuery
  ),
});

export default RootQuery;
