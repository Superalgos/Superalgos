import gql from 'graphql-tag'

const getSecret = gql`
  query($id: ID!){
    keyVault_Secret(id: $id)
  }
`

const editCloneMutation = gql`
  mutation($id: ID!, $type: String!, $description: String!, $validFrom: Int!,
            $validTo: Int!, $active: Boolean!, $botId: ID!){
    operations_EditClone(
      id: $id,
      type: $type,
      description: $description,
      validFrom: $validFrom,
      validTo: $validTo,
      active: $active,
      botId: $botId
    ){
      id
      key
    }
  }
`

const getCloneQuery = gql`
  query($id: ID!){
    opeations_Clone(id: $id) {
      id
      authId
      key
      type
      description
      exchange
      validFrom
      validTo
      active
      botId
    }
  }
`

const getAuditLog = gql`
  query($key: String!){
    keyVault_AuditLogs(key: $key){
      id,
      date,
      action,
      details
    }
  }
`

export { getSecret, editCloneMutation,
  getCloneQuery, getAuditLog }
