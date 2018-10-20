import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import EditCompetitionMutation from './EditCompetition'
import RegisterMutation from './Register'
import EditParticipantMutation from './EditParticipant'
import AddRuleMutation from './AddRule'
import EditRuleMutation from './EditRule'
import AddPrizeMutation from './AddPrize'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    EditCompetitionMutation,
    RegisterMutation,
    EditParticipantMutation,
    AddRuleMutation,
    EditRuleMutation,
    AddPrizeMutation
  )
})

export default Mutation
