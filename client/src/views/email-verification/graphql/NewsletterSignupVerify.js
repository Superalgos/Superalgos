/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const NEWSLETTER_SIGNUP_VERIFY = gql`
  mutation NewsletterSignupVerify($token: String!){
    notifications_Master_NewsletterSignupVerify(token: $token)
  }
`

export default NEWSLETTER_SIGNUP_VERIFY
