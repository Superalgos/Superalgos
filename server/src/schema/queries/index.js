import {
  GraphQLObjectType
} from 'graphql'

import ListClones from './ListClones'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    ListClones
  )
})

export default RootQuery
