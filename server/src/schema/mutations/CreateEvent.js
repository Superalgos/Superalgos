import { AuthentificationError } from '../../errors';
import { EventType } from '../types';
import { Event, Formula, Plotter } from '../../models';
import { slugify } from '../../utils/functions';
import { EventInputType } from '../types/input';

export const args = {
  event: { type: EventInputType },
};

const resolve = (parent, { event }, context) => {
  const hostId = context.userId;
  if (!hostId) {
    throw new AuthentificationError();
  }

  const eventSqueleton = { ...event };
  delete eventSqueleton.plotter;
  delete eventSqueleton.formula;
  eventSqueleton.hostId = hostId;

  const newEvent = new Event(eventSqueleton);
  newEvent.designator = `${slugify(newEvent.name)}-${newEvent._id}`;
  const { formula, plotter } = event;

  return new Promise((res, rej) => {
    if (formula) {
      formula.ownerId = hostId;
      const newFormula = new Formula(formula);
      newFormula.save((err) => {
        if (err) {
          rej(err);
        }
      });
      newEvent.formulaId = newFormula._id;
    }
    if (plotter) {
      plotter.ownerId = hostId;
      const newPlotter = new Plotter(plotter);
      newPlotter.save((err) => {
        if (err) {
          rej(err);
        }
      });
      newEvent.plotterId = newPlotter._id;
    }
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
