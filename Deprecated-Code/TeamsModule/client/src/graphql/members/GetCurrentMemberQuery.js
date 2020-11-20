/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetCurrentMember = gql`
  query currentMember {
    teams_CurrentMember {
      ...MemberInfo
    }
  }
`

export default GetCurrentMember
