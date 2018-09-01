/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const VerifyEmailMutation = gql`
  mutation verifyEmail($token: String!) {
    verifyEmail(token: $token) {
      user {
        email
      }
      errors {
        field
        message
      }
    }
  }
`
