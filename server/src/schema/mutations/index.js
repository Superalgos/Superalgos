import {
  GraphQLObjectType
} from 'graphql'

import AddCloneMutation from './AddCloneMutation'
import RemoveCloneMutation from './RemoveCloneMutation'
import UpdateExecutionSummary from './UpdateExecutionSummary'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddCloneMutation,
    RemoveCloneMutation,
    UpdateExecutionSummary
  )
})

export default Mutation
