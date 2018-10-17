/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DELETE_TEAM = gql`
  mutation deleteTeam($slug: String!) {
    teams_DeleteTeam(slug: $slug) {
      id
    }
  }
`

export default DELETE_TEAM
