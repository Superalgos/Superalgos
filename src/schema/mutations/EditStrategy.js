import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { StrategyType } from '../types';
import { Strategy } from '../../models';
import { StrategyInputType } from '../types/input';

const args = {
  id: { type: new GraphQLNonNull(GraphQLID) },
  strategy: { type: new GraphQLNonNull(StrategyInputType) },
};

const resolve = (parent, { id: _id, strategy: editedStrategy }) => new Promise((res, rej) => {
  Strategy.findOne({ _id }).exec((err, strategy) => {
    if (err) {
      rej(err);
      return;
    }
    strategy.history.push({
      updatedAt: strategy.updatedAt,
      subStrategies: strategy.subStrategies,
    });
    strategy.subStrategies = editedStrategy.subStrategies;
    strategy.save((error) => {
      if (error) {
        rej(error);
        return;
      }
      res(strategy);
    });
  });
});

const mutation = {
  editStrategy: {
    type: StrategyType,
    args,
    resolve,
  },
};

export default mutation;
