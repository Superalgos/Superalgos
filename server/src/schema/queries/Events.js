import {
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import { EventType } from '../types';
import { Event } from '../../models';
import { UNPUBLISHED, ARCHIVED } from '../../enums/EventState';

const args = {
  minDate: { type: GraphQLInt },
  maxDate: { type: GraphQLInt },
};

const resolve = (parent, { minDate, maxDate }) => Event.find(
  Object.assign(
    { state: { $nin: [UNPUBLISHED, ARCHIVED] } },
    minDate || maxDate
      ? {
        startDatetime:
          Object.assign(
            minDate ? { $gte: minDate } : {},
            maxDate ? { $lte: maxDate } : {},
          ),
      }
      : {},
  ),
);

const query = {
  events: {
    type: new GraphQLList(EventType),
    args,
    resolve,
  },
};

export default query;
