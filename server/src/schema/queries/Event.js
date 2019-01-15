import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { DatabaseError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
};

const resolve = (parent, { eventId: _id }) => new Promise((res, rej) => {
  Event.findOne({ _id }).exec((err, event) => {
    if (err) {
      rej(err);
      return;
    }
    if (!event) {
      rej(new DatabaseError('None of the events respond to that id'));
      return;
    }
    res(event);
  });
});

const query = {
  event: {
    type: EventType,
    args,
    resolve,
  },
};

export default query;
