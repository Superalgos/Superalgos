/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DELETE_TEAM = gql`
  mutation deleteTeam($id: ID!) {
    deleteTeam(id: $id) {
      id
    }
  }
`

export default DELETE_TEAM
