import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import EventStateEnum from '../types/enum/EventState';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  state: { type: EventStateEnum },
};

const resolve = (parent, { eventId: _id, state }, { userId: hostId }) => {
  if (!hostId) {
    throw new AuthentificationError();
  }

  return new Promise((res, rej) => {
    Event.findOneAndUpdate({ _id, hostId }, { state }, { new: true }, (err, modifiedEvent) => {
      if (err) {
        rej(err);
        return;
      }
      res(modifiedEvent);
    });
  });
};

const mutation = {
  changeEventState: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
