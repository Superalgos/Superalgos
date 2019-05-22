import { AuthenticationError } from '../../errors';
import { TeamType } from '../types';
import { Ecosystem } from '../../models';
import { TeamInputType } from '../types/input';
import logger from '../../utils/logger';
import { createContainer } from '../../storage/AzureStorage';

import {
  GraphQLString
} from 'graphql';

export const args = {
  team: { type: TeamInputType },
};

const resolve = async (parent, { team }, context) => {
  logger.debug('addTeam -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthenticationError()
  }

  try {
    let userEcosystem = await Ecosystem.findOne({
      authId: context.userId
    })

    if (!userEcosystem) {
      logger.debug('addTeam -> Ecosystem not found for the user, creating a new one from default.')

      let defaultEcosystem = require('../../config/ecosystem.json')
      userEcosystem = new Ecosystem(defaultEcosystem)
      userEcosystem.authId = context.userId
    }

    let containerName = team.codeName
    await createContainer(containerName)
    // let accessKey = await createPrivateAccessKey()
    let accessKey = "test"

    if (!team.host) {
      let nodeEndpoint = {
        url: process.env.SUPERALGOS_NODE_ENDPOINT,
        container: containerName,
        accessKey: accessKey,
      }
      team.host = nodeEndpoint
    }

    userEcosystem.teams.push(team)
    await userEcosystem.save()

  } catch (err) {
    logger.error('addTeam -> Error: %s', err.stack)
    // throw new ServerError('There has been an error adding the team.')
    return 'There has been an error adding the team.'
  }
};

const mutation = {
  addTeam: {
    type: GraphQLString,
    args,
    resolve,
  },
};

export default mutation;
