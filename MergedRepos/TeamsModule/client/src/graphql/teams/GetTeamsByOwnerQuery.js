/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GET_TEAMS_BY_OWNER = gql`
  query teamsByOwnerQuery {
    teams_TeamsByOwner {
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
        banner
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
      fb {
        id
        name
        slug
        avatar
        kind
        status {
          status
          reason
          createdAt
        }
      }
    }
  }
`

export default GET_TEAMS_BY_OWNER
