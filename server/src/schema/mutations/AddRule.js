import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
} from 'graphql';
import {
  AuthentificationError,
  DatabaseError,
  WrongArgumentsError,
} from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, { eventDesignator, title, description }, context) => {
  const hostId = context.userId;
  if (!hostId) {
    throw new AuthentificationError();
  }
  return new Promise((res, rej) => {
    Event.findOne({ designator: eventDesignator, hostId }).exec((err, event) => {
      if (err) {
        rej(err);
        return;
      }
      if (!event) {
        rej(new DatabaseError('None of the events you own respond to that designator'));
        return;
      }
      if (event.rules.some(rule => rule.title === title)) {
        rej(new WrongArgumentsError('A prize for that rank already exists'));
        return;
      }
      const isFree = pos => event.rules.some(rule => rule.pos === pos);
      let position = 1;
      let shouldGrow = isFree(position);
      while (shouldGrow) {
        position += 1;
        shouldGrow = isFree(position);
      }
      event.rules.push({
        position,
        title,
        description,
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
  addRule: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
