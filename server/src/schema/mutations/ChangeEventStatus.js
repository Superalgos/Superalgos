import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import EventStatusEnum from '../types/enum/EventStatus';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  status: { type: EventStatusEnum },
};

const resolve = (parent, { eventId: _id, status }, { userId: hostId }) => {
  if (!hostId) {
    throw new AuthentificationError();
  }

  return new Promise((res, rej) => {
    Event.findOneAndUpdate({ _id, hostId }, { status }, { new: true }, (err, modifiedEvent) => {
      if (err) {
        rej(err);
        return;
      }
      res(modifiedEvent);
    });
  });
};

const mutation = {
  changeEventStatus: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
