/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GET_ALL_TEAMS_QUERY = gql`
  query teamsQuery {
    teams {
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
            member {
              alias
              authId
            }
          }
        }
      }
    }
  }
`

export default GET_ALL_TEAMS_QUERY
