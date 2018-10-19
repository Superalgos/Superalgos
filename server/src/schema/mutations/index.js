import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import RegisterToCompetitionMutation from './RegisterToCompetition'
import AddRuleToCompetitionMutation from './AddRuleToCompetition'
import EditCompetitionMutation from './EditCompetition'
import EditRuleOfCompetitionMutation from './EditRuleOfCompetition'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    RegisterToCompetitionMutation,
    AddRuleToCompetitionMutation,
    EditCompetitionMutation,
    EditRuleOfCompetitionMutation
  )
})

export default Mutation
