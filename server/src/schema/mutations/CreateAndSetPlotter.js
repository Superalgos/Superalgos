import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { AuthentificationError, DatabaseError } from '../../errors';
import { EventType } from '../types';
import { Event, Plotter } from '../../models';

const args = {
  eventDesignator: { type: new GraphQLNonNull(GraphQLString) },
  name: { type: new GraphQLNonNull(GraphQLString) },
  host: { type: new GraphQLNonNull(GraphQLString) },
  repo: { type: new GraphQLNonNull(GraphQLString) },
  moduleName: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, {
  name, host, repo, moduleName, eventDesignator,
}, context) => {
  const ownerId = context.userId;
  if (!ownerId) {
    throw new AuthentificationError();
  }
  const newPlotter = new Plotter({
    name, host, repo, moduleName, ownerId,
  });
  return new Promise((res, rej) => {
    Event.findOne({ designator: eventDesignator, hostId: ownerId }).exec((err, event) => {
      if (err) {
        rej(err);
        return;
      }
      if (!event) {
        rej(new DatabaseError('None of the events you own respond to that designator'));
        return;
      }

      newPlotter.save((error) => {
        if (error) {
          rej(error);
          return;
        }

        event.plotter = newPlotter._id;
        event.save((eventError) => {
          if (eventError) {
            rej(eventError);
            return;
          }
          res(event);
        });
      });
    });
  });
};

const mutation = {
  createAndSetPlotter: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
