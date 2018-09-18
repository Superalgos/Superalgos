/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const UPDATE_TEAM_PROFILE = gql`
<<<<<<< HEAD
  mutation UpdateTeamProfileMutation($slug: String!, $owner: String!, $description: String, $motto: String) {
    updateTeamProfile(slug: $slug, owner: $owner, description: $description, motto: $motto) {
=======
  mutation UpdateTeamProfileMutation(
    $slug: String!
    $owner: String!
    $description: String
    $motto: String
  ) {
    updateTeamProfile(
      slug: $slug
      owner: $owner
      description: $description
      motto: $motto
    ) {
>>>>>>> feature/client-refactor-react
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
    }
  }
`

export default UPDATE_TEAM_PROFILE
