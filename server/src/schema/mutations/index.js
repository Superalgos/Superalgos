import {
  GraphQLObjectType
} from 'graphql'

import HostCompetitionMutation from './HostCompetition'
import RegisterToCompetitionMutation from './RegisterToCompetition'
import AddRuleToCompetitionMutation from './AddRuleToCompetition'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostCompetitionMutation,
    RegisterToCompetitionMutation,
    AddRuleToCompetitionMutation
  )
})

export default Mutation
