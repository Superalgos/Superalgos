import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import {
  WrongArgumentsError,
  AuthentificationError,
  NotImplementedYetError,
} from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import EventStateEnum from '../types/enum/EventState';

import {
  UNPUBLISHED,
  PUBLISHED,
  CANCELLED,
  STARTING,
  RUNNING,
  INTERRUPTED,
  FINISHED,
  ARCHIVED,
} from '../../enums/EventState';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  state: { type: EventStateEnum },
};

const resolve = (parent, { eventId: _id, state }, { userId: hostId }) => {
  if (!hostId) {
    throw new AuthentificationError();
  }

  switch (state) {
    case UNPUBLISHED:
      throw new NotImplementedYetError('Still working on it');
    case PUBLISHED:
      return new Promise((res, rej) => {
        Event.findOneAndUpdate({ _id, hostId, state: UNPUBLISHED }, { state }, { new: true }, (err, modifiedEvent) => {
          if (err) {
            rej(err);
            return;
          }
          res(modifiedEvent);
        });
      });
    case CANCELLED:
      throw new NotImplementedYetError('We are still wondering about cancellation conditions, '
      + 'if you have any inputs or proposition don\t hesitate to contact us');
    case STARTING:
      throw new NotImplementedYetError('Still working on it');
    case RUNNING:
      throw new NotImplementedYetError('Still working on it');
    case INTERRUPTED:
      throw new NotImplementedYetError('We are still wondering about interuption conditions, '
      + 'if you have any inputs or proposition don\t hesitate to contact us');
    case FINISHED:
      throw new NotImplementedYetError('Still working on it');
    case ARCHIVED:
      return new Promise((res, rej) => {
        Event.findOneAndUpdate({ _id, hostId, state: FINISHED }, { state }, { new: true }, (err, modifiedEvent) => {
          if (err) {
            rej(err);
            return;
          }
          res(modifiedEvent);
        });
      });
    default:
      throw new WrongArgumentsError('You shouldn\'t even be allowed to be there');
  }
};

const mutation = {
  changeEventState: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
