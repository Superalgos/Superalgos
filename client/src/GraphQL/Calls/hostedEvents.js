import gql from 'graphql-tag'
import { eventMinimalInfo } from '../Fragments'

const EVENTS_HOSTEVENT = gql`
  mutation Hosts_HostEvent($name: String!, $description: String!, $startDatetime: Int!, $finishDatetime: Int!) {
    events_HostEvent(name: $name, description: $description, startDatetime: $startDatetime, finishDatetime: $finishDatetime) {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`
const EVENTS_EVENTSBYHOST = gql`
  query Hosts_EventsByHost{
    events_EventsByHost {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`
export default {
  EVENTS_HOSTEVENT,
  EVENTS_EVENTSBYHOST
}
