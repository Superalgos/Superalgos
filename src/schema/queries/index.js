import {
  GraphQLObjectType,
} from 'graphql';

import EventQuery from './Event';
import EventsQuery from './Events';
import FormulasQuery from './Formulas';
import PlottersQuery from './Plotters';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    EventQuery,
    EventsQuery,
    FormulasQuery,
    PlottersQuery,
  ),
});

export default RootQuery;
