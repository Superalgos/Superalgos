import {
  GraphQLObjectType
} from 'graphql'

import CompetitionsQuery from './Competitions'
import CompetitionsByHostQuery from './CompetitionsByHost'
import CompetitionsByDevTeamQuery from './CompetitionsByDevTeam'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    CompetitionsQuery,
    CompetitionsByHostQuery,
    CompetitionsByDevTeamQuery
  )
})

export default RootQuery
