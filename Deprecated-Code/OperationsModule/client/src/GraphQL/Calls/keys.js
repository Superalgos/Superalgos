import gql from 'graphql-tag'

export const GET_ALL_KEYS = gql`
  query {
    keyVault_AvailableKeys {
      id
      key
      description
      exchange
    }
  }
`

export default {
  GET_ALL_KEYS
}
