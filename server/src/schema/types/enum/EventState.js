import {
  GraphQLEnumType,
} from 'graphql';

import { EventStateEnum } from '../../../enums/EventState';

const values = {};
EventStateEnum.forEach((EventState) => {
  values[EventState] = { value: EventState };
});

const EventStateEnumType = new GraphQLEnumType({
  name: 'EventStateEnum',
  values,
});

export {
  EventStateEnumType as default,
};
