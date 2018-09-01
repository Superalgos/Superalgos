/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const currentUser = gql`
  query currentUser {
    currentUser {
      ...UserInfo
    }
  }
`

export default currentUser
