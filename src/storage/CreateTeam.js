import logger from '../utils/logger'
import { copyBot } from './CopyBot'
import { copySimulator } from './CopySimulator'

export const createTeam = async (team) => {
    try {
        logger.debug('createTeam started for team %s', team.codeName)

        let  storage = require ('./providers/AzureStorage') // Default value
        if (process.env.STORAGE_PROVIDER === 'Minio') {
            storage = require ('./providers/MinioStorage')
        }

        let containerName = team.codeName
        await storage.createContainer(containerName)
        let accessKey = storage.createPrivateAccessKey(containerName, "WRITE", 365)

        await copyBot(storage, team.codeName, team.bot.codeName, team.bot.displayName)
        await copySimulator(storage, team.codeName, team.bot.codeName, team.bot.displayName)

        return accessKey

    } catch (err) {
        logger.error('createTeam error for teamCodeName: %s, error: %s', team.bot.codeName, err.stack)
        throw err
    }
}
