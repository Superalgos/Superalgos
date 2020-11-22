import { GraphQLObjectType } from 'graphql'
import ListClones from './ListClones'
import HistoryClones from './HistoryClones'
import GetClones from './GetClones'
import GetClone from './GetClone'

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: Object.assign(
    ListClones,
    HistoryClones,
    GetClones,
    GetClone
  )
})

export default RootQuery
