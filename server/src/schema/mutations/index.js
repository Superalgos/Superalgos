import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import EditCompetitionMutation from './EditCompetition'
import RegisterToCompetitionMutation from './RegisterToCompetition'
import EditParticipantMutation from './EditParticipant'
import AddRuleMutation from './AddRule'
import EditRuleMutation from './EditRule'
import ReorderRulesMutation from './ReorderRules'
import AddPrizeMutation from './AddPrize'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    EditCompetitionMutation,
    RegisterToCompetitionMutation,
    EditParticipantMutation,
    AddRuleMutation,
    EditRuleMutation,
    ReorderRulesMutation,
    AddPrizeMutation
  )
})

export default Mutation
