import logger from '../utils/logger'
import { copyBot } from './CopyBot'
import { copySimulator } from './CopySimulator'

export const copyBots = async (storage, team) => {
    try {
        logger.debug('copyBots started for team %s', team.codeName)
        let bots = []

        let tradingBot = await copyBot(storage, team.codeName, team.bot.codeName, team.bot.displayName)
        bots.push(tradingBot)

        let simulatorBot = await copySimulator(storage, team.codeName, team.bot.codeName, team.bot.displayName)
        bots.push(simulatorBot)

        return bots

    } catch (err) {
        logger.error('copyBots error for teamCodeName: %s, error: %s', team.bot.codeName, err.stack)
        throw err
    }
}
