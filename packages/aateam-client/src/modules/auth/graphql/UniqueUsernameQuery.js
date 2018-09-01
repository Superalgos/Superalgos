/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const UniqueUsernameQuery = gql`
  query uniqueUsername($username: String!) {
    uniqueUsername(username: $username)
  }
`

export default UniqueUsernameQuery
