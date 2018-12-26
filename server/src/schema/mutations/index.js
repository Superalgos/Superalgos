import {
  GraphQLObjectType
} from 'graphql'

import AddCloneMutation from './AddCloneMutation'
import RemoveCloneMutation from './RemoveCloneMutation'

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddCloneMutation,
    RemoveCloneMutation
  )
})

export default Mutation
