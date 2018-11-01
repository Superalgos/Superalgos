import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { PlotterType } from '../types';
import { Plotter } from '../../models';

const args = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  host: { type: new GraphQLNonNull(GraphQLString) },
  repo: { type: new GraphQLNonNull(GraphQLString) },
  moduleName: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, {
  name, host, repo, moduleName,
}, context) => {
  const ownerId = context.userId;
  if (!ownerId) {
    throw new AuthentificationError();
  }
  const newPlotter = new Plotter({
    name, host, repo, moduleName, ownerId,
  });
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
