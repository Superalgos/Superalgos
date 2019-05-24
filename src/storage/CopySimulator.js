import beautify from 'json-beautify'
import logger from '../utils/logger'

export const copySimulator = async (storage, teamCodeName, botCodeName, botDisplayName) => {
    try {
        logger.debug('copySimulator started for bot %s', 'simulator-' + botCodeName)

        let containerName = 'aamasters'
        let templatePath = 'AAMasters/bots/AAJason-Indicator-Bot'
        let commons = await storage.getFileContent(containerName, templatePath + '/Commons.js')
        let config = await storage.getFileContent(containerName, templatePath + '/this.bot.config.json')
        let codeDaily = await storage.getFileContent(containerName, templatePath + '/Multi-Period-Daily/User.Bot.js')
        let codeMarket = await storage.getFileContent(containerName, templatePath + '/Multi-Period-Market/User.Bot.js')

        // Change config to adapt the new indicator
        let newBotCodeName = 'simulator-' + botCodeName
        let parsedConfig = JSON.parse(config)
        parsedConfig.displayName = 'Simulator ' + botDisplayName
        parsedConfig.codeName = newBotCodeName
        parsedConfig.devTeam = teamCodeName
        parsedConfig.profilePicture = newBotCodeName + '.png'

        parsedConfig.processes[0].statusDependencies[0].devTeam = teamCodeName
        parsedConfig.processes[0].statusDependencies[0].bot = newBotCodeName
        parsedConfig.processes[1].statusDependencies[2].devTeam = teamCodeName
        parsedConfig.processes[1].statusDependencies[2].bot = newBotCodeName

        //Changing Indicator Output
        parsedConfig.products[0].storageAccount = teamCodeName
        parsedConfig.products[0].dataSets[0].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Market/@Period'
        parsedConfig.products[0].dataSets[1].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Daily/@Period/@Year/@Month/@Day'
        parsedConfig.products[0].dataSets[1].dataRange.filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Daily'

        parsedConfig.products[1].storageAccount = teamCodeName
        parsedConfig.products[1].dataSets[0].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Market/@Period'
        parsedConfig.products[1].dataSets[1].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Daily/@Period/@Year/@Month/@Day'
        parsedConfig.products[1].dataSets[1].dataRange.filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Daily'

        parsedConfig.products[2].storageAccount = teamCodeName
        parsedConfig.products[2].dataSets[0].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Strategies/Multi-Period-Market/@Period'
        parsedConfig.products[2].dataSets[1].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Strategies/Multi-Period-Daily/@Period/@Year/@Month/@Day'
        parsedConfig.products[2].dataSets[1].dataRange.filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Strategies/Multi-Period-Daily'

        parsedConfig.products[3].storageAccount = teamCodeName
        parsedConfig.products[3].dataSets[0].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Trades/Multi-Period-Market/@Period'
        parsedConfig.products[3].dataSets[1].filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Trades/Multi-Period-Daily/@Period/@Year/@Month/@Day'
        parsedConfig.products[3].dataSets[1].dataRange.filePath = teamCodeName + '/' + parsedConfig.codeName + '.1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Trades/Multi-Period-Daily'

        // Write the new files
        let newSimulatorName = 'simulator-' + newBotCodeName + '-Indicator-Bot'
        let newSimulatorPath = teamCodeName + '/bots/' + newSimulatorName
        await storage.writeFileContent(teamCodeName, newSimulatorPath + '/Commons.js', commons)
        await storage.writeFileContent(teamCodeName, newSimulatorPath + '/this.bot.config.json', beautify(parsedConfig, null, 2, 80))
        await storage.writeFileContent(teamCodeName, newSimulatorPath + '/Multi-Period-Daily/User.Bot.js', codeDaily)
        await storage.writeFileContent(teamCodeName, newSimulatorPath + '/Multi-Period-Market/User.Bot.js', codeMarket)

        logger.debug('copySimulator completed for bot %s', newBotCodeName)

    } catch (err) {
        logger.error('copySimulator error for bot: %s. %s', botCodeName, err)
        throw err
    }
}

export const removeSimulator = async (storage, teamCodeName, botCodeName) => {
    try {
        logger.debug('removeSimulator started for bot %s', botCodeName)

        // Delete simulator code
        let newSimulatorName = 'simulator-' + botCodeName + '-Indicator-Bot'
        let newSimulatorPath = teamCodeName + '/bots/' + newSimulatorName
        await storage.deleteBlob(teamCodeName, newSimulatorPath + '/Commons.js')
        await storage.deleteBlob(teamCodeName, newSimulatorPath + '/this.bot.config.json')
        await storage.deleteBlob(teamCodeName, newSimulatorPath + '/Multi-Period-Daily/User.Bot.js')
        await storage.deleteBlob(teamCodeName, newSimulatorPath + '/Multi-Period-Market/User.Bot.js')

        logger.debug('removeSimulator completed for bot %s', botCodeName)

    } catch (err) {
        logger.error('copySimulator error for bot %s: %s', botCodeName, err)
        throw err
    }
}
