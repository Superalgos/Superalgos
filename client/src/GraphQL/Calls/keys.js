import gql from 'graphql-tag'

export const GET_ALL_KEYS = gql`
  query {
    keyVault_AvailableKeys {
      id
      key
      description
    }
  }
`

export default {
  GET_ALL_KEYS
}
