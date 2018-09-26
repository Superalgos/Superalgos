/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const USER_BY_AUTHID = gql`
query($authId: String){
    userByAuthId (authId: $authId){
      id
      alias
      firstName
      middleName
      lastName
      bio
      email
      emailVerified
      isDeveloper
      isDataAnalyst
      isTrader
      role {
        id
      }
    }
}
`

export default USER_BY_AUTHID
