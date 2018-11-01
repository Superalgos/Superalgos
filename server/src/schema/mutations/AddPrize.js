import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
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
  rank: { type: new GraphQLNonNull(GraphQLInt) },
  amount: { type: new GraphQLNonNull(GraphQLInt) },
};

const resolve = (parent, { eventDesignator, rank, amount }, context) => {
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
      if (event.prizes.some(prize => prize.rank === rank)) {
        rej(new WrongArgumentsError('A prize for that rank already exists'));
        return;
      }
      event.prizes.push({
        rank,
        amount,
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
  addPrize: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
