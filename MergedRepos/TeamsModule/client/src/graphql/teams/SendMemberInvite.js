/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const SEND_MEMBER_INVITE = gql`
  mutation sendMemberInvite($email: String!, $teamId: String!) {
    teams_SendMemberInviteSG(email: $email, teamId: $teamId)
  }
`

export default SEND_MEMBER_INVITE
