/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const UPDATE_TEAM_PROFILE = gql`
  mutation UpdateTeamProfileMutation(
    $slug: String!,
    $owner: String!,
    $description: String,
    $motto: String,
    $avatar: String,
    $banner: String
  ) {
    updateTeamProfile(
      slug: $slug,
      owner: $owner,
      description: $description,
      motto: $motto
      avatar: $avatar,
      banner: $banner
    ) {
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
`

export default UPDATE_TEAM_PROFILE
