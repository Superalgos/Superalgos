import beautify from 'json-beautify'
import logger from '../utils/logger'
import readFile from '../utils/readFile'

export const copyBot = async (teamCodeName, botCodeName, botDisplayName, writeFileContent) => {
    try {
        logger.debug('copyBot started for bot %s', botCodeName)
        // File imports
        const botCode = await readFile('./src/storage/templates/TradingBot/User.Bot.js')
        const config = await readFile('./src/storage/templates/TradingBot/this.bot.config.json')

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

        // Creating a new trading bot
        let newBotPath = teamCodeName + '/bots/' + botCodeName + '-Trading-Bot'
        await writeFileContent(teamCodeName, newBotPath + '/Trading-Process/User.Bot.js', botCode)
        await writeFileContent(teamCodeName, newBotPath + '/this.bot.config.json', beautify(parsedConfig, null, 2, 80))

        return parsedConfig
    } catch (err) {
        logger.error('copyBot error for bot: %s. %s', botCodeName, err)
        throw err
    }
}
