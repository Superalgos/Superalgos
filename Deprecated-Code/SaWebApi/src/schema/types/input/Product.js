import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

import { DataSetInputType } from './index';
import { ExchangeInputType } from './index';
import { PlotterInputType } from './index';

const Type = new GraphQLInputObjectType({
  name: 'ProductInput',
  description: 'Payload for product input.',
  fields: () => ({
    codeName: { type: new GraphQLNonNull(GraphQLString) },
    displayName: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    dataSets: { type: new GraphQLList(DataSetInputType) },
    exchangeList: { type: new GraphQLList(ExchangeInputType) },
    plotter: { type: PlotterInputType }
  }),
});

export default Type;
