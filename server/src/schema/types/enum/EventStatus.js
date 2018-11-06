import {
  GraphQLEnumType,
} from 'graphql';

import { EventStatusEnum } from '../../../enums/EventStatus';

const values = {};
EventStatusEnum.forEach((EventStatus) => {
  values[EventStatus] = { value: EventStatus };
});

const EventStatusEnumType = new GraphQLEnumType({
  name: 'EventStatusEnum',
  values,
});

export {
  EventStatusEnumType as default,
};
