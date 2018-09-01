/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const RegisterSubmitMutation = gql`
  mutation registerSubmit($input: RegisterSubmitInput!) {
    registerSubmit(input: $input) {
      user {
        id
        email
      }
      errors {
        field
        message
      }
    }
  }
`

export const UserInfo = gql`
  fragment UserInfo on User {
    id
    username
    role
    isActive
    email
    profile {
      firstName
      lastName
      fullName
    }
    auth {
      certificate {
        serial
      }
      facebook {
        fbId
        displayName
      }
      google {
        googleId
        displayName
      }
      github {
        ghId
        displayName
      }
      linkedin {
        lnId
        displayName
      }
    }
  }
`
