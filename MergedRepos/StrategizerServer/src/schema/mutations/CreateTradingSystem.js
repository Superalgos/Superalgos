import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { TradingSystemType } from '../types';
import { TradingSystem } from '../../models';
import { TradingSystemInputType } from '../types/input';
import defaultTradingSystem from '../../templates/tradingSystemTemplate';

export const args = {
  fbSlug: { type: new GraphQLNonNull(GraphQLString) },
  tradingSystem: { type: TradingSystemInputType },
};

const resolve = (parent, { fbSlug, tradingSystem }) => {
  if (tradingSystem === undefined) {
    tradingSystem = defaultTradingSystem;
  }
  tradingSystem.fbSlug = fbSlug;
  tradingSystem.history = [];
  const newTradingSystem = new TradingSystem(tradingSystem);

  return new Promise((res, rej) => {
    newTradingSystem.save((err) => {
      if (err) {
        rej(err);
        return;
      }
      res(newTradingSystem);
    });
  });
};

const mutation = {
  createTradingSystem: {
    type: TradingSystemType,
    args,
    resolve,
  },
};

export default mutation;
