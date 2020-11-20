import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import { EventInputType } from '../types/input';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  event: { type: EventInputType },
};

const resolve = (parent, { eventId: _id, event }, { userId: hostId }) => {
  if (!hostId) {
    throw new AuthentificationError();
  }

  return new Promise((res, rej) => {
    Event.findOneAndUpdate({ _id, hostId }, event, { new: true }, (err, modifiedEvent) => {
      if (err) {
        rej(err);
        return;
      }
      res(modifiedEvent);
    });
  });
};

const mutation = {
  editEvent: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
