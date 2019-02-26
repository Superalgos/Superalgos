import gql from 'graphql-tag'

const FB_FRAGMENT = gql`{
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
}`

module.exports = FB_FRAGMENT
