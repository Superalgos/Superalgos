import gql from 'graphql-tag'

const fragments = `
  name
`

export const HOSTS_HOSTEVENT = gql`
  mutation Hosts_HostEvent($name: String!, $description: String!, $startDatetime: Int!, $finishDatetime: Int!) {
    hosts_HostEvent(name: $name, description: $description, startDatetime: $startDatetime, finishDatetime: $finishDatetime) {
      ${fragments}
    }
  }
`
export const HOSTS_EVENTSBYHOST = gql`
  query Hosts_EventsByHost{
    hosts_EventsByHost {
      ${fragments}
    }
  }
`
