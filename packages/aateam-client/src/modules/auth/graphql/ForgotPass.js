/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const ForgotPassSubmitMutation = gql`
  mutation forgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`
