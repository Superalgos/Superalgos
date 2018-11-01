import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';
import { AuthentificationError, DatabaseError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLID) },
  rank: { type: new GraphQLNonNull(GraphQLInt) },
  amount: { type: GraphQLInt },
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
      const prizeIndex = event.prizes.findIndex(prize => prize.rank === rank);
      if (!prizeIndex) {
        rej(new DatabaseError('There is no prize for that index'));
        return;
      }
      event.prizes[prizeIndex].amount = amount || event.prizes[prizeIndex].amount;
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
  editPrize: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
