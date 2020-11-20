import { AuthentificationError } from '../../errors';
import { PlotterType } from '../types';
import { Plotter } from '../../models';
import { PlotterInputType } from '../types/input';

const args = {
  plotter: { type: PlotterInputType },
};

const resolve = (parent, { plotter }, { userId: ownerId }) => {
  if (!ownerId) {
    throw new AuthentificationError();
  }

  plotter.ownerId = ownerId;
  const newPlotter = new Plotter(plotter);

  return new Promise((res, reject) => {
    newPlotter.save((err) => {
      if (err) {
        reject(err);
        return;
      }
      res(newPlotter);
    });
  });
};

const mutation = {
  createPlotter: {
    type: PlotterType,
    args,
    resolve,
  },
};

export default mutation;
