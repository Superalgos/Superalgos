import gql from 'graphql-tag';
import { eventFullInfo } from '../Fragments';

const EVENTS_EVENT = gql`
  query Hosts_Event($designator: ID!) {
    events_Event(designator: $designator) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

export default {
  EVENTS_EVENT,
};
