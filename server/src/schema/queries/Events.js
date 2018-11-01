import {
  GraphQLInt,
  GraphQLList,
} from 'graphql';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  minDate: { type: GraphQLInt },
  maxDate: { type: GraphQLInt },
};

const resolve = (parent, { minDate, maxDate }) => Event.find(
  Object.assign(
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
