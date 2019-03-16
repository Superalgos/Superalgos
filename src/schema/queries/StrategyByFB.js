import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { DatabaseError } from '../../errors';
import { StrategyType } from '../types';
import { Strategy } from '../../models';

const args = {
  fbId: { type: new GraphQLNonNull(GraphQLID) },
};

const resolve = (parent, { fbId }) => new Promise((res, rej) => {
  Strategy.findOne({ fbId }).exec((err, strategy) => {
    if (err) {
      rej(err);
      return;
    }
    if (!strategy) {
      rej(new DatabaseError('None of the strategy are linked to that fbId'));
      return;
    }
    res(strategy);
  });
});

const query = {
  strategyByFb: {
    type: StrategyType,
    args,
    resolve,
  },
};

export default query;
