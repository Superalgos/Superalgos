import {
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import EventStateEnum from '../types/enum/EventState';
import { Event } from '../../models';
import { UNPUBLISHED, ARCHIVED } from '../../enums/EventState';

const args = {
  state: { type: EventStateEnum },
  hostId: { type: GraphQLString },
  participantId: { type: GraphQLString },
  inviteeId: { type: GraphQLString },
  minStartDate: { type: GraphQLInt },
  maxStartDate: { type: GraphQLInt },
  minEndDate: { type: GraphQLInt },
  maxEndDate: { type: GraphQLInt },
};

const resolve = (parent, {
  state,
  hostId,
  participantId,
  inviteeId,
  minStartDate,
  maxStartDate,
  minEndDate,
  maxEndDate,
}, { userId }) => {
  if (state === UNPUBLISHED && hostId !== userId && hostId !== 'self') {
    throw new AuthentificationError('You cannot get unpublished events of other users.');
  }


  return new Promise((res, rej) => {
    Event.find(
      Object.assign(
        state ? { state } : { state: { $nin: [UNPUBLISHED, ARCHIVED] } },
        (hostId && hostId !== 'self') ? { hostId } : {},
        (hostId === 'self') ? { hostId: userId } : {},
        participantId ? { participants: { $elemMatch: { participantId } } } : {},
        inviteeId ? { invitations: { $elemMatch: { inviteeId } } } : {},
        minStartDate || maxStartDate
          ? {
            startDatetime:
              Object.assign(
                minStartDate ? { $gte: minStartDate } : {},
                maxStartDate ? { $lte: maxStartDate } : {},
              ),
          }
          : {},
        minEndDate || maxEndDate
          ? {
            endDatetime:
                Object.assign(
                  minEndDate ? { $gte: minEndDate } : {},
                  maxEndDate ? { $lte: maxEndDate } : {},
                ),
          }
          : {},
      ), (err, events) => {
        if (err) {
          rej(err);
          return;
        }
        res(events);
      },
    );
  });
};

const query = {
  events: {
    type: new GraphQLList(EventType),
    args,
    resolve,
  },
};

export default query;
