/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetTeamQuery = gql`
  query teamDetailsQuery($auth0id: String!) {
    teamByOwner(ownerId: $auth0id) {
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

export default GetTeamQuery
