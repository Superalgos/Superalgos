import gql from 'graphql-tag'
import { eventMinimalInfo } from '../Fragments'

const HOSTS_EVENTS = gql`
  query Hosts_Events{
    hosts_Events {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`
export default {
  HOSTS_EVENTS
}
