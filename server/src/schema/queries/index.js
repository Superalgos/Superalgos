import {
  GraphQLObjectType
} from 'graphql'

import ListClones from './ListClones'
import HistoryClones from './HistoryClones'
import GetClones from './GetClones'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    ListClones,
    HistoryClones,
    GetClones
  )
})

export default RootQuery
