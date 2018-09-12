/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const UniqueTeamnameQuery = gql`
  query uniqueTeamname($name: String!) {
    teamByName(name: $name) {
      name
    }
  }
`

export default UniqueTeamnameQuery
