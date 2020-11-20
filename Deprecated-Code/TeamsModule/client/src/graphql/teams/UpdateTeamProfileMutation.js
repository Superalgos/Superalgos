/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const UPDATE_TEAM_PROFILE = gql`
  mutation UpdateTeamProfileMutation(
    $slug: String!,
    $description: String,
    $motto: String,
    $avatar: String,
    $banner: String
  ) {
    teams_UpdateTeamProfile(
      slug: $slug,
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
`

export default UPDATE_TEAM_PROFILE
