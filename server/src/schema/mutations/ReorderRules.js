import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';
import { AuthentificationError, DatabaseError } from '../../errors';
import { isBetween } from '../../utils/functions';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  fromPosition: { type: new GraphQLNonNull(GraphQLInt) },
  toPosition: { type: new GraphQLNonNull(GraphQLInt) },
};

const resolve = (parent, { eventDesignator, fromPosition, toPosition }, context) => {
  const hostId = context.userId;
  if (!hostId) {
    throw new AuthentificationError();
  }
  return new Promise((res, rej) => {
    Event.findOne({ designator: eventDesignator, hostId: context.userId }).exec((err, event) => {
      if (err) {
        rej(err);
        return;
      }
      if (!event) {
        rej(new DatabaseError('None of the events you own respond to that designator'));
        return;
      }
      const delta = fromPosition > toPosition ? 1 : -1;
      event.rules.forEach((part) => {
        if (part.position === fromPosition) {
          part.position = toPosition;
        } else if (isBetween(part.position, fromPosition, toPosition)) {
          part.position += delta;
        }
      });

      event.save((error) => {
        if (error) {
          rej(error);
          return;
        }
        res(event);
      });
    });
  });
};

const mutation = {
  reorderRules: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
