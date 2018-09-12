/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetCurrentMember = gql`
  query currentMember {
    currentMember {
      ...MemberInfo
    }
  }
`

export default GetCurrentMember
