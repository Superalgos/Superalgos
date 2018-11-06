import gql from 'graphql-tag';
import { eventMinimalInfo } from '../Fragments';

const EVENTS_EVENTS = gql`
  query Events_Events{
    events_Events {
      ...EventMinimalInfo
    }
  }
  ${eventMinimalInfo}
`;
export default {
  EVENTS_EVENTS,
};
