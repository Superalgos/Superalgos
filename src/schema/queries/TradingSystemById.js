import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { DatabaseError } from '../../errors';
import { TradingSystemType } from '../types';
import { TradingSystem } from '../../models';

const args = {
  id: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, { id }) => new Promise((res, rej) => {
  TradingSystem.findOne({ _id: id }).exec((err, tradingSystem) => {
    if (err) {
      rej(err);
      return;
    }
    if (!tradingSystem) {
      rej(new DatabaseError('None of the tradingSystem are linked to that id'));
      return;
    }
    res(tradingSystem);
  });
});

const query = {
  tradingSystemById: {
    type: TradingSystemType,
    args,
    resolve,
  },
};

export default query;
