import {
  GraphQLObjectType,
} from 'graphql'

import AddTeamMutation from './AddTeam'
import DeleteTeamMutation from './DeleteTeam'
import CreateFileMutation from './CreateFile'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddTeamMutation,
    DeleteTeamMutation,
    CreateFileMutation
  )
})

export default Mutation
