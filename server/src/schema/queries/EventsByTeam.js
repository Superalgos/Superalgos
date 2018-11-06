import {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { EventType } from '../types';
import { Event } from '../../models';
import { UNPUBLISHED, ARCHIVED } from '../../enums/EventStatus';

const args = {
  teamId: { type: new GraphQLNonNull(GraphQLString) },
  minDate: { type: GraphQLInt },
  maxDate: { type: GraphQLInt },
};

const resolve = (parent, { teamId, minDate, maxDate }) => Event.find(
  Object.assign(
    {
      participants: { $elemMatch: { teamId } },
      status: { $nin: [UNPUBLISHED, ARCHIVED] },
    },

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
  eventsByTeam: {
    type: new GraphQLList(EventType),
    args,
    resolve,
  },
};

export default query;
