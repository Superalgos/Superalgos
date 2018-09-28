const gql = require('graphql-tag')

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
}`

module.exports = TEAMS_CONNECTIONS_FRAGMENT
