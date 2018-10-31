import gql from 'graphql-tag'

const TEAMS_CONNECTIONS_FRAGMENT = gql`{
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
}`

module.exports = TEAMS_CONNECTIONS_FRAGMENT
