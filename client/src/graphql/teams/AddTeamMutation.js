/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const AddTeamMutation = gql`
  mutation CreateTeamMutation($name: String!, $slug: String!, $owner: String!) {
    createTeam(name: $name, slug: $slug, owner: $owner) {
      id
      name
      slug
      owner {
        auth0id
        id
      }
    }
  }
`
