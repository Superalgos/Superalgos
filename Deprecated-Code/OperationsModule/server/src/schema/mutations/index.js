import { GraphQLObjectType } from 'graphql'
import AddCloneMutation from './AddCloneMutation'
import RemoveCloneMutation from './RemoveCloneMutation'
import UpdateExecutionSummary from './UpdateExecutionSummary'
import RunSimulation from './RunSimulation'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddCloneMutation,
    RemoveCloneMutation,
    UpdateExecutionSummary,
    RunSimulation
  )
})

export default Mutation
