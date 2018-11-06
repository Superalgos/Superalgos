import gql from 'graphql-tag';
import { eventFullInfo } from '../Fragments';

const EVENTS_EVENT = gql`
  query Events_Event($eventId: ID!) {
    events_Event(eventId: $eventId) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

export default {
  EVENTS_EVENT,
};
