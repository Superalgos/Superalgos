/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const FinishRegisterMutation = gql`
  mutation finishRegister($input: RegisterUserInput!) {
    finishRegister(input: $input) {
      user {
        id
        email
        username
      }
      errors {
        field
        message
      }
    }
  }
`
