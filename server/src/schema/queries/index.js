import {
  GraphQLObjectType
} from 'graphql'

import ListClones from './ListClones'
import HistoryClones from './HistoryClones'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    ListClones,
    HistoryClones
  )
})

export default RootQuery
