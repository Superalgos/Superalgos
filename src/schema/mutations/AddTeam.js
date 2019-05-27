import logger from '../../utils/logger'
import { AuthenticationError, WrongArgumentsError } from '../../errors'
import { TeamType } from '../types'
import { Ecosystem } from '../../models'
import { TeamInputType } from '../types/input'
import { createTeam } from '../../storage/CreateTeam'

export const args = { team: { type: TeamInputType } }

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

    for (let i = 0; i < userEcosystem.devTeams.length; i++) {
      const auxTeam = userEcosystem.devTeams[i];
      if (auxTeam.codeName === team.codeName) {
        throw new WrongArgumentsError("The team already exist on the user ecosystem.")
      }
    }

    let accessKey = await createTeam(team)
    if (!team.host) {
      let nodeEndpoint = {
        url: process.env.SUPERALGOS_NODE_ENDPOINT,
        container: team.codeName,
        accessKey: accessKey,
      }
      team.host = nodeEndpoint
    }

    let bots = []
    let tradingBot = {
      codeName: team.bot.codeName,
      displayName: team.bot.displayName,
      repo: team.bot.codeName + '-Trading-Bot',
      configFile: 'this.bot.config.json'
    }
    bots.push(tradingBot)

    let simulatorBot = {
      codeName: 'simulator-' + team.bot.codeName,
      displayName: 'Simulator ' + team.bot.displayName,
      repo: 'simulator-' + team.bot.codeName + '-Indicator-Bot',
      configFile: 'this.bot.config.json'
    }
    bots.push(simulatorBot)

    team.bots = bots

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
