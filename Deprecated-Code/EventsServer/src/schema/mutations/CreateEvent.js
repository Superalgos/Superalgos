import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import { EventInputType } from '../types/input';

export const args = {
  event: { type: EventInputType },
};

const resolve = (parent, { event }, { userId: hostId }) => {
  if (!hostId) {
    throw new AuthentificationError();
  }

  event.hostId = hostId;
  const newEvent = new Event(event);

  return new Promise((res, rej) => {
    newEvent.save((err) => {
      if (err) {
        rej(err);
        return;
      }
      res(newEvent);
    });
  });
};

const mutation = {
  createEvent: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
