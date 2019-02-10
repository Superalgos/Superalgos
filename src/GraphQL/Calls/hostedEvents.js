import gql from 'graphql-tag';
import { eventFullInfo } from '../Fragments';

const EVENTS_CREATEEVENT = gql`
  mutation Events_CreateEvent($event: events_EventInput!) {
    events_CreateEvent(event: $event) {
      ...eventFullInfo
    }
  }
  ${eventFullInfo}
`;

const EVENTS_EDITEVENT = gql`
  mutation Events_EditEvent($eventId:  ID!, $event: events_EventInput!) {
    events_EditEvent(eventId: $eventId, event: $event) {
      ...eventFullInfo
    }
  }
  ${eventFullInfo}
`;

const EVENTS_EVENTSBYHOST = gql`
  query Events_EventsByHost{
    events_EventsByHost {
      ...eventFullInfo
    }
  }
  ${eventFullInfo}
`;

export default {
  EVENTS_CREATEEVENT,
  EVENTS_EDITEVENT,
  EVENTS_EVENTSBYHOST,
};
