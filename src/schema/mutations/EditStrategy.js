import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import { StrategyType } from '../types';
import { Strategy } from '../../models';
import { StrategyInputType } from '../types/input';

const args = {
  id: { type: new GraphQLNonNull(GraphQLID) },
  newStrategy: { type: new GraphQLNonNull(StrategyInputType) },
};

const resolve = (parent, { id: _id, newStrategy }) => new Promise((res, rej) => {
  Strategy.findOne({ _id }).exec((err, strategy) => {
    if (err) {
      rej(err);
      return;
    }
    strategy = newStrategy;
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
  editParticipant: {
    type: StrategyType,
    args,
    resolve,
  },
};

export default mutation;
