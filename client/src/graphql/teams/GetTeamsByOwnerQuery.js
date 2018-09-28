/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GET_TEAMS_BY_OWNER = gql`
  query teamsByOwnerQuery {
    teamsByOwner {
      id
      name
      slug
      owner
      status {
        status
        reason
        createdAt
      }
      createdAt
      profile {
        avatar
        description
        motto
        updatedAt
      }
      members {
        role
        email
        member {
          alias
          authId
        }
        status {
          id
          status
          reason
          createdAt
        }
      }
    }
  }
`

export default GET_TEAMS_BY_OWNER
