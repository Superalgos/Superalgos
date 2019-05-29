import logger from '../utils/logger'

export const deleteTeam = async (team) => {
    try {
        logger.debug('deleteTeam started for team %s', team.codeName)

        let  storage = require ('./providers/AzureStorage') // Default value
        if (process.env.STORAGE_PROVIDER === 'Minio') {
            storage = require ('./providers/MinioStorage')
        }

        await storage.deleteContainer(team.codeName)

    } catch (err) {
        logger.error('deleteTeam error for teamCodeName: %s, error: %s', team.codeName, err.stack)
        throw err
    }
}
