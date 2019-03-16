import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { StrategyType } from '../types';
import { Strategy } from '../../models';
import { StrategyInputType } from '../types/input';

export const args = {
  fbId: { type: new GraphQLNonNull(GraphQLString) },
  strategy: { type: StrategyInputType },
};

const resolve = (parent, { fbId, strategy }) => {
  strategy.fbId = fbId;
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
