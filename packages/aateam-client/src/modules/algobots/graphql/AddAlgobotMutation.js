/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const AddAlgobotMutation = gql`
  mutation addAlgobot($input: AddAlgobotInput!) {
    addAlgobot(input: $input) {
      id
      name
      slug
      owner
      avatar
      repo
      team_id
      type
    }
  }
`
