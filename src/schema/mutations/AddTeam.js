import logger from '../../utils/logger'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import { TeamType } from '../types'
import { Ecosystem } from '../../models'
import { TeamInputType } from '../types/input'
import { copyBots } from '../../storage/CopyBots'

export const args = { team: { type: TeamInputType } }

const resolve = async (parent, { team }, context) => {
  logger.debug('addTeam -> Entering Function.')

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

    for (let i = 0; i < userEcosystem.devTeams.length; i++) {
      const auxTeam = userEcosystem.devTeams[i];
      if (auxTeam.codeName === team.codeName) {
        throw new WrongArgumentsError("The team already exist on the user ecosystem.")
      }
    }

    let  storage = require ('../../storage/providers/AzureStorage') // Default value
    if (process.env.STORAGE_PROVIDER === 'Minio') {
        storage = require ('../../storage/providers/MinioStorage')
    }

    let containerName = team.codeName
    await storage.createContainer(containerName)
    let accessKey = storage.createPrivateAccessKey(containerName, "WRITE", 365)

    let botsConfigurations = await copyBots(storage, team)
    team.bots = botsConfigurations
    if (!team.host) {
      let nodeEndpoint = {
        url: process.env.SUPERALGOS_NODE_ENDPOINT,
        storage: process.env.STORAGE_URL,
        container: team.codeName,
        accessKey: accessKey,
      }
      team.host = nodeEndpoint
    }

    userEcosystem.devTeams.push(team)
    await userEcosystem.save()
    return team
  } catch (err) {
    logger.error('addTeam -> Error: %s', err.stack)
    throw err
  }
}

const mutation = {
  addTeam: {
    type: TeamType,
    args,
    resolve,
  }
}

export default mutation;
