/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const SET_TEAM_MEMBER_ROLE = gql`
  mutation setTeamMemberRole($teamId: String!, $memberId: String!, $role: String!) {
    teams_SetTeamMemberRole(teamId: $teamId, memberId: $memberId, role: $role) {
      id
    }
  }
`

export default SET_TEAM_MEMBER_ROLE
