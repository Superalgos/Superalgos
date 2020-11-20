import gql from 'graphql-tag';
import { eventFullInfo } from '../Fragments';

const EVENTS_EVENTS = gql`
  query Events_Events($minStartDate: Int, $maxStartDate: Int, $minEndDate: Int, $maxEndDate: Int){
    events_Events(minStartDate: $minStartDate, maxStartDate: $maxStartDate, minEndDate: $minEndDate, maxEndDate: $maxEndDate) {
      ...EventFullInfo
    }
  }
  ${eventFullInfo}
`;

export default {
  EVENTS_EVENTS,
};
