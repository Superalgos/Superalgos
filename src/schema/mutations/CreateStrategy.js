import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { StrategyType } from '../types';
import { Strategy } from '../../models';
import { StrategyInputType } from '../types/input';

export const args = {
  fbSlug: { type: new GraphQLNonNull(GraphQLString) },
  strategy: { type: StrategyInputType },
};

const resolve = (parent, { fbSlug, strategy }) => {
  strategy.fbSlug = fbSlug;
  const newStrategy = new Strategy(strategy);

  return new Promise((res, rej) => {
    newStrategy.save((err) => {
      if (err) {
        rej(err);
        return;
      }
      res(newStrategy);
    });
  });
};

const mutation = {
  createStrategy: {
    type: StrategyType,
    args,
    resolve,
  },
};

export default mutation;
