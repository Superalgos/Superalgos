import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { DatabaseError } from '../../errors';
import { StrategyType } from '../types';
import { Strategy } from '../../models';

const args = {
  fbSlug: { type: new GraphQLNonNull(GraphQLID) },
};

const resolve = (parent, { fbSlug }) => new Promise((res, rej) => {
  Strategy.findOne({ fbSlug }).exec((err, strategy) => {
    if (err) {
      rej(err);
      return;
    }
    if (!strategy) {
      rej(new DatabaseError('None of the strategy are linked to that fbSlug'));
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
