/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GET_ALL_TEAMS_QUERY = gql`
  query teamsQuery {
    teams_Teams {
      edges {
        node {
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
    }
  }
`

export default GET_ALL_TEAMS_QUERY
