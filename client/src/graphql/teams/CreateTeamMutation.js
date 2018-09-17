/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

const CREATE_TEAM = gql`
  mutation CreateTeamMutation($name: String!, $slug: String!, $owner: String!) {
    createTeam(name: $name, slug: $slug, owner: $owner) {
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
