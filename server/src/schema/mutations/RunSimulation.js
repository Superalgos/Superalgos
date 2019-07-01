import { GraphQLString } from 'graphql'
import { SimulationInputType } from '../types/input'
import removeKuberneteClone from '../../kubernetes/removeClone'
import { Clone } from '../../models'
import { Indicator } from '../../enums/BotTypes'
import { DateTime } from 'luxon'
import teamQuery from '../../graphQLCalls/teamQuery'
import cloneDetails from '../cloneDetails'
import {
  AuthenticationError,
  OperationsError
} from '../../errors'
import logger from '../../config/logger'
import createKubernetesClone from '../../kubernetes/createClone'

const args = {
  simulation: { type: SimulationInputType }
}

const resolve = async (parent, { simulation }, context) => {
  logger.debug('runSimulation -> Entering Fuction.')

  if (!context.userId) {
    throw new AuthenticationError()
  }

  try {
    // Find all running clones
    let clones = await Clone.find({
      authId: context.userId,
      active: true
    }).sort({ createDatetime: -1 })

    // Find all user bots
    let allUserBotsResponse = await teamQuery(context.authorization, null)
    let allUserBots = allUserBotsResponse.data.data.teams_FbByOwner.edges
    let simulatorBot

    // Identify clones to stop, if any
    for (var j = 0; j < allUserBots.length; j++) {
      let bot = allUserBots[j].node
      if (bot.kind === Indicator && bot.slug.substring(0, 10) === "simulator-") {
        simulatorBot = bot // TODO One simulator per user
        for (var i = 0; i < clones.length; i++) {
          if (clones[i].botId === bot.id) {
            if ((simulation.timePeriodDailyArray !== undefined && clones[i].processName === "Multi-Period-Daily") ||
              (simulation.timePeriodMarketArray !== undefined && clones[i].processName === "Multi-Period-Market") ||
              (simulation.timePeriodDailyArray === undefined && simulation.timePeriodMarketArray === undefined)) {

              logger.debug('runSimulation -> Stop running clones.')

              await removeKuberneteClone(clones[i]._id)
              logger.debug('runSimulation -> Clone Removed from Kubernetes: %s.', clones[i]._id)

              let clone = await Clone.findOneAndUpdate({ _id: clones[i]._id, authId: context.userId }, { active: false }, { new: true })

              if (!clone) throw new Error('Clone Not Found.')
              logger.debug('runSimulation -> Clone Removed from the DB.')
            }
          }
        }
      }
    }

    if (simulation.beginDatetime === undefined) {
      simulation.beginDatetime = DateTime.utc().minus({ days: 7 }).startOf('day')
    }

    if (simulation.resumeExecution === undefined) {
      simulation.resumeExecution = false
    }

    if (simulatorBot !== undefined) {
      if (simulation.timePeriodDailyArray !== undefined && simulation.timePeriodDailyArray.length > 0) {
        simulation.timePeriod = simulation.timePeriodDailyArray
        await createSimulatorClone(simulation, "Multi-Period-Daily", context.userId, simulatorBot, context.authorization)
      }

      if (simulation.timePeriodMarketArray !== undefined && simulation.timePeriodMarketArray.length > 0) {
        simulation.timePeriod = simulation.timePeriodMarketArray
        await createSimulatorClone(simulation, "Multi-Period-Market", context.userId, simulatorBot, context.authorization)
      }

      if (simulation.timePeriodDailyArray === undefined && simulation.timePeriodMarketArray === undefined) {
        simulation.timePeriod = ["15-min", "10-min", "05-min"]
        await createSimulatorClone(simulation, "Multi-Period-Daily", context.userId, simulatorBot, context.authorization)

        simulation.timePeriod = ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"]
        await createSimulatorClone(simulation, "Multi-Period-Market", context.userId, simulatorBot, context.authorization)
      }

      return "Simulation Clones Recreated."
    } else {
      return "The user doesn't have any simulator bot."
    }
  } catch (err) {
    logger.error('runSimulation -> Error: %s', err.stack)
    throw new OperationsError('There has been an error creating the clones.')
  }
}

async function createSimulatorClone(simulation, processName, userId, simulatorBot, authorization) {
  let clone = {
    teamId: simulatorBot.team.id,
    botId: simulatorBot.id,
    mode: "noTime",
    kind: "Indicator",
    botSlug: simulatorBot.slug,
    resumeExecution: simulation.resumeExecution,
    exchangeName: "Poloniex", // TODO pending enable multiple exchange
    beginDatetime: simulation.beginDatetime,
    processName: processName,
    createDatetime: new Date().valueOf() / 1000 | 0,
    active: true,
    authId: userId,
    timePeriod: simulation.timePeriod.toString(),
    authorization: authorization
  }

  let newClone = new Clone(clone)
  clone.id = newClone._id

  logger.debug('runSimulation -> Creating %s clone on the Database.', processName)
  await newClone.save()

  clone = cloneDetails(simulatorBot, clone)
  await createKubernetesClone(clone)

  logger.debug('runSimulation -> %s clone created.', processName)
}

const RunSimulationMutation = {
  runSimulation: {
    type: GraphQLString,
    args,
    resolve
  }
}

export default RunSimulationMutation
