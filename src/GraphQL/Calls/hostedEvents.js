import gql from 'graphql-tag';
import { eventFullInfo } from '../Fragments';

const EVENTS_CREATEEVENT = gql`
  mutation Events_CreateEvent($event: events_EventInput!) {
    events_CreateEvent(event: $event) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

const EVENTS_EDITEVENT = gql`
  mutation Events_EditEvent($eventId:  ID!, $event: events_EventInput!) {
    events_EditEvent(eventId: $eventId, event: $event) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

const EVENTS_EVENTSBYHOST = gql`
  query Events_Events(
    $hostId: String,
    $state: events_EventStateEnum,
    $minStartDate: Int,
    $maxStartDate: Int,
    $minEndDate: Int,
    $maxEndDate: Int
  ){
    events_Events(
      hostId: $hostId,
      state: $state,
      minStartDate: $minStartDate,
      maxStartDate: $maxStartDate,
      minEndDate: $minEndDate,
      maxEndDate: $maxEndDate
    ) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

const EVENTS_PUBLISHEVENT = gql`
  mutation Events_ChangeEventState($eventId:  ID!, $state: events_EventStateEnum) {
    events_ChangeEventState(eventId: $eventId, state: $state) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

export default {
  EVENTS_CREATEEVENT,
  EVENTS_EDITEVENT,
  EVENTS_EVENTSBYHOST,
  EVENTS_PUBLISHEVENT,
};
