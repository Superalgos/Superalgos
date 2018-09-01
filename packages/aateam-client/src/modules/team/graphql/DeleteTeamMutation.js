/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DeleteTeamMutation = gql`
  mutation deleteTeam($id: ID!, $owner: String!) {
    deleteTeam(id: $id, owner: $owner) {
      id
    }
  }
`
