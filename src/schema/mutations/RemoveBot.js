import logger from '../../utils/logger'
import { BotInputType, } from '../types/input'
import { BotType, } from '../types'
import { Ecosystem } from '../../models'

export const args = { bot: { type: BotInputType } }

const resolve = async (parent, { bot }, context) => {
  logger.debug('removeBot -> Dev team: %s. Bot: %s', bot.devTeam, bot.codeName)
  try {

    let userEcosystem = await Ecosystem.findOne({
      authId: context.userId
    })

    if (!userEcosystem) {
      throw 'Ecosystem not found for the user.'
    }

    let removedBotClone
    for (let i = 0; i < userEcosystem.devTeams.length; i++) {
      const auxTeam = userEcosystem.devTeams[i]
      if (auxTeam.codeName === bot.devTeam) {
        for (let j = 0; j < auxTeam.bots.length; j++) {
          const auxBot = auxTeam.bots[j]
          if (auxBot.codeName === bot.codeName && auxBot.cloneId === bot.cloneId) {
            for (let k = 0; k < auxBot.products.length; k++) {
              const auxProduct = auxBot.products[k]
              if (auxProduct.codeName === bot.productCodeName) {
                removedBotClone = auxBot
                auxTeam.bots.splice(j, 1)
                break
              }
            }
            break
          }
        }
        break
      }
    }

    if (removedBotClone) {
      await userEcosystem.save()
      return removedBotClone
    } else {
      throw 'Algobot not found.'
    }

  } catch (err) {
    logger.error('removeBot -> Error: %s', err.message)
    throw err
  }
}

const mutation = {
  removeBot: {
    type: BotType,
    args,
    resolve,
  }
}

export default mutation;
