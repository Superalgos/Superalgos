import gql from 'graphql-tag'
import { eventFullInfo } from '../Fragments'

const HOSTS_EVENT = gql`
  query Hosts_Event($designator: ID!) {
    hosts_Event(designator: $designator) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`

export default {
  HOSTS_EVENT
}
