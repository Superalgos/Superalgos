/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const GetAlgobotQuery = gql`
  query getAlgobotByOwner($owner: Int!) {
    getAlgobotByOwner(owner: $owner) {
      id
      name
      slug
      owner
      avatar
      repo
      team_id
      type
    }
  }
`

export default GetAlgobotQuery
