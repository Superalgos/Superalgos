/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const RefreshTokens = gql`
  mutation refreshTokens($refreshToken: String!) {
    refreshTokens(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`

export default RefreshTokens
