/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetAllTeamsQuery = gql`
  query teamsQuery {
    teams {
      edges {
        node {
          id
          name
          slug
          profile {
            avatar
            description
            motto
          }
          owner {
            nickname
            visible
            profile {
              avatar
            }
          }
          members {
            role
            member {
              nickname
              visible
              profile {
                avatar
              }
            }
          }
        }
      }
    }
  }
`

export default GetAllTeamsQuery
