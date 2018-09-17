/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DELETE_TEAM = gql`
  mutation deleteTeam($slug: String!) {
    deleteTeam(slug: $slug) {
      id
    }
  }
`

export default DELETE_TEAM
