/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const CREATE_TEAM = gql`
  mutation CreateTeamMutation($name: String!, $slug: String!, $botName: String!, $botSlug: String!) {
    teams_CreateTeam(name: $name, slug: $slug, botName: $botName, botSlug: $botSlug) {
      id
      name
      slug
      owner
      members {
        role
        member {
          authId
          alias
        }
      }
    }
  }
`

export default CREATE_TEAM
