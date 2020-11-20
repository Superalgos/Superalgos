import {
  GraphQLObjectType,
} from 'graphql'

import AddTeamMutation from './AddTeam'
import DeleteTeamMutation from './DeleteTeam'
import CreateFileMutation from './CreateFile'
import AddBotMutation from './AddBot'
import RemoveBotMutation from './RemoveBot'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddTeamMutation,
    DeleteTeamMutation,
    CreateFileMutation,
    AddBotMutation,
    RemoveBotMutation
  )
})

export default Mutation
