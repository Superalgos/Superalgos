import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import { AuthentificationError, DatabaseError } from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  designator: { type: new GraphQLNonNull(GraphQLID) },
  name: { type: GraphQLString },
  description: { type: GraphQLString },
  startDatetime: { type: GraphQLInt },
  finishDatetime: { type: GraphQLInt },
  formulaId: { type: GraphQLString },
  plotterId: { type: GraphQLString },
};

const resolve = (parent, {
  designator, name, description, startDatetime, finishDatetime, formulaId, plotterId,
}, context) => {
  const hostId = context.userId;
  if (!hostId) {
    throw new AuthentificationError();
  }
  return new Promise((res, rej) => {
    Event.findOne({ designator, hostId }).exec((err, event) => {
      if (err) {
        rej(err);
        return;
      }
      if (!event) {
        rej(new DatabaseError('None of the events you own respond to that designator'));
        return;
      }
      event.name = name || event.name;
      event.description = description || event.description;
      event.startDatetime = startDatetime || event.startDatetime;
      event.finishDatetime = finishDatetime || event.finishDatetime;
      event.formula = formulaId || event.formula;
      event.plotter = plotterId || event.plotter;

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
  editEvent: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
