/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const UPDATE_FB = gql`
  mutation UpdateFBMutation($teamSlug: String!, $avatar: String) {
    updateFB(teamId, $teamSlug, avatar: $avatar) {
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

export default UPDATE_FB
