import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { AuthentificationError, DatabaseError } from '../../errors';
import { EventType } from '../types';
import { Event, Formula } from '../../models';

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLString) },
  name: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, { name, eventDesignator }, context) => {
  const ownerId = context.userId;
  if (!ownerId) {
    throw new AuthentificationError();
  }
  const newFormula = new Formula({ name, ownerId });
  return new Promise((res, reject) => {
    Event.findOne({ designator: eventDesignator, hostId: ownerId }).exec((err, event) => {
      if (err) {
        reject(err);
        return;
      }
      if (!event) {
        reject(new DatabaseError('None of the events you own respond to that designator'));
        return;
      }
      newFormula.save((error) => {
        if (error) {
          reject(error);
          return;
        }
        event.formula = newFormula._id;
        event.save((eventError) => {
          if (eventError) {
            reject(eventError);
            return;
          }
          res(event);
        });
      });
    });
  });
};

const mutation = {
  createAndSetFormula: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
