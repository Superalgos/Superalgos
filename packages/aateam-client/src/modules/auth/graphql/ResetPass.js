/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const ResetPassSubmitMutation = gql`
  mutation resetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      errors {
        field
        message
      }
    }
  }
`
