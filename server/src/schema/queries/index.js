import {
  GraphQLObjectType
} from 'graphql'

import EventQuery from './Event'
import EventsQuery from './Events'
import EventsByHostQuery from './EventsByHost'
import EventsByTeamQuery from './EventsByTeam'
import FormulasQuery from './Formulas'
import PlottersQuery from './Plotters'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    EventQuery,
    EventsQuery,
    EventsByHostQuery,
    EventsByTeamQuery,
    FormulasQuery,
    PlottersQuery
  )
})

export default RootQuery
