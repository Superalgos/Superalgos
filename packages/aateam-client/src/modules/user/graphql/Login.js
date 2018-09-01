/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const LoginMutation = gql`
  mutation login($input: LoginUserInput!) {
    login(input: $input) {
      tokens {
        accessToken
        refreshToken
      }
      user {
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
