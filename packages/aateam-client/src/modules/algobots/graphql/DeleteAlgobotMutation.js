/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const DeleteAlgobotMutation = gql`
  mutation deleteAlgobot($id: Int!) {
    deleteAlgobot(id: $id) {
      id
    }
  }
`
