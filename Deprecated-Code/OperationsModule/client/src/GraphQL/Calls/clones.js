import gql from 'graphql-tag'
import { clone } from '../Fragments'

const OPERATIONS_ADD_CLONE = gql`
  mutation Operations_AddClone($clone: operations_CloneInput!) {
    operations_AddClone(clone: $clone) {
      ...clone
    }
  }
  ${clone}
`

const OPERATIONS_LIST_CLONES = gql`
  query Operations_Clones{
    operations_Clones(queryLogs: true) {
      ...clone
    }
  }
  ${clone}
`

const OPERATIONS_HISTORY_CLONES = gql`
  query Operations_HistoryClones{
    operations_HistoryClones(botType: "Trading") {
      ...clone
    }
  }
  ${clone}
`

const OPERATIONS_REMOVE_CLONE = gql`
  mutation Operations_RemoveClone($id: ID!){
    operations_RemoveClone( id: $id)
  }
`

export default {
  OPERATIONS_LIST_CLONES,
  OPERATIONS_HISTORY_CLONES,
  OPERATIONS_ADD_CLONE,
  OPERATIONS_REMOVE_CLONE
}
