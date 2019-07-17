import logger from '../../utils/logger'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import { TeamType } from '../types'
import { Ecosystem } from '../../models'
import { TeamInputType } from '../types/input'
import { copyBot } from '../../storage/CopyBot'
import { copySimulator } from '../../storage/CopySimulator'
import { createContainer, writeFileContent } from '../../storage/providers/MinioStorage'
import crypto from 'crypto'

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

    // Teams will be created on a local minio container
    let botsConfigurations = []
    try {
      await createContainer(team.codeName)
    } catch (err) {
      if (err.message !== 'Your previous request to create the named bucket succeeded and you already own it.') {
        logger.error('addTeam -> Error: %s', err.stack)
        throw err
      } else {
        logger.warn('addTeam -> %s', err.message)
      }
    }

    let tradingBot = await copyBot(team.codeName, team.bot.codeName, team.bot.displayName, writeFileContent)
    botsConfigurations.push(tradingBot)
    let simulatorBot = await copySimulator(team.codeName, team.bot.codeName, team.bot.displayName, writeFileContent)
    botsConfigurations.push(simulatorBot)

    team.bots = botsConfigurations

    if (!team.host) {
      let nodeEndpoint = {
        url: process.env.NODE_ENDPOINT,
        storage: 'localStorage',
        container: team.codeName,
        accessKey: crypto.randomBytes(128).toString('hex'),
        ownerKey: crypto.randomBytes(128).toString('hex')
      }
      team.host = nodeEndpoint
    }

    userEcosystem.devTeams.push(team)
    userEcosystem.markModified("devTeams")
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
