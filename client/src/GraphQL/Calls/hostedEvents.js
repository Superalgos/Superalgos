import gql from 'graphql-tag'
import { eventMinimalInfo } from '../Fragments'

const HOSTS_HOSTEVENT = gql`
  mutation Hosts_HostEvent($name: String!, $description: String!, $startDatetime: Int!, $finishDatetime: Int!) {
    hosts_HostEvent(name: $name, description: $description, startDatetime: $startDatetime, finishDatetime: $finishDatetime) {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`
const HOSTS_EVENTSBYHOST = gql`
  query Hosts_EventsByHost{
    hosts_EventsByHost {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`
export default {
  HOSTS_HOSTEVENT,
  HOSTS_EVENTSBYHOST
}
