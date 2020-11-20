import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { DatabaseError } from '../../errors';
import { TradingSystemType } from '../types';
import { TradingSystem } from '../../models';

const args = {
  fbSlug: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, { fbSlug }) => new Promise((res, rej) => {
  TradingSystem.findOne({ fbSlug }).exec((err, tradingSystem) => {
    if (err) {
      rej(err);
      return;
    }
    if (!tradingSystem) {
      rej(new DatabaseError('None of the tradingSystem are linked to that fbSlug'));
      return;
    }
    res(tradingSystem);
  });
});

const query = {
  tradingSystemByFb: {
    type: TradingSystemType,
    args,
    resolve,
  },
};

export default query;
