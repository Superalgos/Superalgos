import gql from 'graphql-tag';
import { eventMinimalInfo } from '../Fragments';

const EVENTS_CREATEEVENT = gql`
  mutation Events_CreateEvent($event:events_EventInput!) {
    events_CreateEvent(event: $event) {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`;
const EVENTS_EVENTSBYHOST = gql`
  query Events_EventsByHost{
    events_EventsByHost {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`;
export default {
  EVENTS_CREATEEVENT,
  EVENTS_EVENTSBYHOST,
};
