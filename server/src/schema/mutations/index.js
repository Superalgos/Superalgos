import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import EditCompetitionMutation from './EditCompetition'
import RegisterToCompetitionMutation from './RegisterToCompetition'
import EditParticipantOfCompetitionMutation from './EditParticipantOfCompetition'
import AddRuleToCompetitionMutation from './AddRuleToCompetition'
import EditRuleOfCompetitionMutation from './EditRuleOfCompetition'
import AddPrizeToCompetitionMutation from './AddPrizeToCompetition'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    EditCompetitionMutation,
    RegisterToCompetitionMutation,
    EditParticipantOfCompetitionMutation,
    AddRuleToCompetitionMutation,
    EditRuleOfCompetitionMutation,
    AddPrizeToCompetitionMutation
  )
})

export default Mutation
