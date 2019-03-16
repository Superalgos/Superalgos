import { StrategyType } from '../types';
import { Strategy } from '../../models';
import { StrategyInputType } from '../types/input';

export const args = {
  strategy: { type: StrategyInputType },
};

const resolve = (parent, { strategy }) => {
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
