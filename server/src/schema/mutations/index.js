import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import RegisterToCompetitionMutation from './RegisterToCompetition'
import AddRuleToCompetitionMutation from './AddRuleToCompetition'
import EditCompetitionMutation from './EditCompetition'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    RegisterToCompetitionMutation,
    AddRuleToCompetitionMutation,
    EditCompetitionMutation
  )
})

export default Mutation
