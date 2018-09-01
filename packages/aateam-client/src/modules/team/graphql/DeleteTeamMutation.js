/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DeleteTeamMutation = gql`
  mutation deleteTeam($id: ID!) {
    deleteTeam(id: $id) {
      id
    }
  }
`
