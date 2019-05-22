import { GraphQLList } from 'graphql';
import { TeamType } from '../types';
import { Ecosystem } from '../../models';
import logger from '../../utils/logger'

const args = {};

const resolve = (parent, args, context) => {
  logger.debug('Listing teams.')

}

const query = {
  teams: {
    type: new GraphQLList(TeamType),
    args,
    resolve,
  },
};

export default query;
