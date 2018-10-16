/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const UPDATE_FB = gql`
  mutation UpdateFBMutation($fbId: String!, $avatar: String) {
    teams_UpdateFB(fbId: $fbId, avatar: $avatar) {
      id
      name
      slug
      avatar
      kind
    }
  }
`

export default UPDATE_FB
