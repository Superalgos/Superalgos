/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const NEWSLETTER_SIGNUP = gql`
  mutation NewsletterSignup($email: String!) {
    notifications_Master_NewsletterSignup(email: $email)
  }
`

export default NEWSLETTER_SIGNUP
