const gql = require('graphql-tag')

const TEAMS_FRAGMENT = gql`{
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
    member {
      alias
      authId
    }
  }
}`

module.exports = TEAMS_FRAGMENT
