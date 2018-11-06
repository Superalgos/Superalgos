import {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { EventType } from '../types';
import { Event } from '../../models';
import { UNPUBLISHED, ARCHIVED } from '../../enums/EventStatus';

const args = {
  hostId: { type: GraphQLString },
  minDate: { type: GraphQLInt },
  maxDate: { type: GraphQLInt },
};

const resolve = (parent, { hostId, minDate, maxDate }, context) => Event.find(
  Object.assign(
    hostId ? { hostId, status: { $nin: [UNPUBLISHED, ARCHIVED] } } : { hostId: context.userId },
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
  eventsByHost: {
    type: new GraphQLList(EventType),
    args,
    resolve,
  },
};

export default query;
