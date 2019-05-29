import beautify from 'json-beautify'
import logger from '../utils/logger'

export const copyBot = async (storage, teamCodeName, botCodeName, botDisplayName) => {
    try {
        logger.debug('copyBot started for bot %s', botCodeName)

        let containerName = 'aavikings'
        let templatePath = 'AAVikings/bots/blumblebee-Trading-Bot'
        let config = await storage.getFileContent(containerName, templatePath + '/this.bot.config.json')
        let code = await storage.getFileContent(containerName, templatePath + '/Trading-Process/User.Bot.js')

        // Change config to adapt the new indicator
        let parsedConfig = JSON.parse(config)
        parsedConfig.displayName = botDisplayName
        parsedConfig.codeName = botCodeName
        parsedConfig.devTeam = teamCodeName
        parsedConfig.profilePicture = botCodeName + '.png'

        parsedConfig.processes[0].statusDependencies[0].devTeam = teamCodeName
        parsedConfig.processes[0].statusDependencies[0].bot = botCodeName
        parsedConfig.processes[0].statusDependencies[1].devTeam = teamCodeName
        parsedConfig.processes[0].statusDependencies[1].bot = 'simulator-' + botCodeName
        parsedConfig.processes[0].statusDependencies[2].devTeam = teamCodeName
        parsedConfig.processes[0].statusDependencies[2].bot = 'simulator-' + botCodeName

        parsedConfig.processes[0].dataDependencies[1].devTeam = teamCodeName
        parsedConfig.processes[0].dataDependencies[1].bot = 'simulator-' + botCodeName
        parsedConfig.processes[0].dataDependencies[2].devTeam = teamCodeName
        parsedConfig.processes[0].dataDependencies[2].bot = 'simulator-' + botCodeName

        // Write the new files
        let newBotPath = teamCodeName + '/bots/' + botCodeName + '-Trading-Bot'
        await storage.writeFileContent(teamCodeName, newBotPath + '/this.bot.config.json', beautify(parsedConfig, null, 2, 80))
        await storage.writeFileContent(teamCodeName, newBotPath + '/Trading-Bot/User.Bot.js', code)

        logger.debug('copyBot completed for bot %s', botCodeName)
        return parsedConfig
    } catch (err) {
        logger.error('copyBot error for bot: %s. %s', botCodeName, err)
        throw err
    }
}

export const removeBot = async (storage, teamCodeName, botCodeName) => {
    try {
        logger.debug('removeBot started for bot %s', botCodeName)

        // Delete bot code
        let newBotPath = teamCodeName + '/bots/' + 'bot-' + botCodeName
        await storage.deleteBlob(teamCodeName, newBotPath + '/this.bot.config.json')
        await storage.deleteBlob(teamCodeName, newBotPath + '/Trading-Bot/User.Bot.js')

        logger.debug('removeBot completed for bot %s', botCodeName)

    } catch (err) {
        logger.error('copyBot error for bot %s: %s', botCodeName, err)
        throw err
    }
}
