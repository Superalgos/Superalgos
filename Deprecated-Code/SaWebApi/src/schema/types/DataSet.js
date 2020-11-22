import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { DataRangeType } from './index'

const DataSetType = new GraphQLObjectType({
  name: 'DataSet',
  fields: () => ({
    codeName: { type: GraphQLString },
    type: { type: GraphQLString },
    validPeriods: { type: new GraphQLList(GraphQLString) },
    filePath: { type: GraphQLString },
    fileName: { type: GraphQLString },
    dataRange: { type: DataRangeType }
  }),
});

export default DataSetType;
