/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetAllAlgobotsQuery = gql`
  query algobots($limit: Int!, $after: Int) {
    algobots(limit: $limit, after: $after) {
      totalCount
      edges {
        cursor
        node {
          id
          name
          slug
          owner
          avatar
          repo
          team_id
          type
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

export default GetAllAlgobotsQuery
