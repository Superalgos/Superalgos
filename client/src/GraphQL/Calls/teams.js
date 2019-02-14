import gql from 'graphql-tag'

export const GET_ALL_TEAMS_QUERY = gql`
  query {
    teams_TeamsByOwner {
      id
      name
      slug
      fb {
        id
        name
        slug
        kind
      }
    }
  }
`

export default {
  GET_ALL_TEAMS_QUERY
}
