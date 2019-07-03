import logger from '../../utils/logger'
import { BotInputType, } from '../types/input'
import { BotType, } from '../types'
import { Ecosystem } from '../../models'

export const args = { bot: { type: BotInputType } }

const resolve = async (parent, { bot }, context) => {
  logger.debug('addBot -> Dev team: %s. Bot: %s', bot.devTeam, bot.codeName)
  try {

    let userEcosystem = await Ecosystem.findOne({
      authId: context.userId
    })

    if (!userEcosystem) {
      throw 'Ecosystem not found for the user.'
    }

    let newBotClone
    for (let i = 0; i < userEcosystem.devTeams.length; i++) {
      const auxTeam = userEcosystem.devTeams[i]
      if (auxTeam.codeName === bot.devTeam) {
        for (let j = 0; j < auxTeam.bots.length; j++) {
          const auxBot = auxTeam.bots[j]
          if (auxBot.codeName === bot.codeName) {
            for (let k = 0; k < auxBot.products.length; k++) {
              const auxProduct = auxBot.products[k]
              if (auxProduct.codeName === bot.productCodeName) {
                newBotClone = {
                  displayName: auxBot.displayName,
                  codeName: auxBot.codeName + '-' + bot.cloneId,
                  type: auxBot.type,
                  profilePicture: auxBot.profilePicture,
                  cloneId: bot.cloneId,
                  products: [auxProduct]
                }
                auxTeam.bots.push(newBotClone)
                break
              }
            }
            break
          }
        }
        break
      }
    }

    if (newBotClone) {
      await userEcosystem.save()
      return newBotClone
    } else {
      throw 'Algobot not found.'
    }

  } catch (err) {
    logger.error('addBot -> Error: %s', err.message)
    throw err
  }
}

const mutation = {
  addBot: {
    type: BotType,
    args,
    resolve,
  }
}

export default mutation;
