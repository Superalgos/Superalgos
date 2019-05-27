import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';

import { ExchangeType, DataSetType, PlotterReferenceType } from './index'

const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    codeName: { type: GraphQLString },
    displayName: { type: GraphQLString },
    description: { type: GraphQLString },
    dataSets: {
      type: new GraphQLList(DataSetType),
      resolve(parent) {
        return parent.dataSets;
      }
    },
    exchangeList:  {
      type: new GraphQLList(ExchangeType),
      resolve(parent) {
        return parent.exchangeList;
      }
    },
    plotter: { type: PlotterReferenceType }
  }),
});

export default ProductType;
