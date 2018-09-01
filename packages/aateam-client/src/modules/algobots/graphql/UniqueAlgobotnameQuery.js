/* eslint-disable no-unused-vars */
import gql from 'graphql-tag'

export const UniqueAlgobotnameQuery = gql`
  query uniqueAlgobotname($algobotname: String!) {
    uniqueAlgobotname(algobotname: $algobotname)
  }
`

export default UniqueAlgobotnameQuery
