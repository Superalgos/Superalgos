const beautify = require("json-beautify")
const { logger } = require('../logs/logger')
const util = require('util')

exports.newCopySimulator = function newCopySimulator(pStorage) {

    let thisObject = {
        getFileContent: getFileContent,
        writeFileContent: writeFileContent,
        copySimulator: copySimulator,
        removeSimulator: removeSimulator
    }

    let storage = pStorage

    return thisObject

    async function copySimulator(pTeamCodeName, pBotCodeName, pBotDisplayName) {
        try {
            logger.info('copySimulator started for bot %s', pBotCodeName)

            let templatePath = "bots/AAJason-Indicator-Bot"
            let commons = await getFileContent(templatePath, "Commons.js")
            let config = await getFileContent(templatePath, "this.bot.config.json")
            let codeDaily = await getFileContent(templatePath + "/Multi-Period-Daily", "User.Bot.js")
            let codeMarket = await getFileContent(templatePath + "/Multi-Period-Market", "User.Bot.js")

            // Change config to adapt the new indicator
            let botCodeName = "simulator-" + pBotCodeName
            let parsedConfig = JSON.parse(config)
            parsedConfig.displayName = "Simulator " + pBotDisplayName
            parsedConfig.codeName = botCodeName
            parsedConfig.devTeam = pTeamCodeName
            parsedConfig.profilePicture = pBotCodeName + ".png"

            let statusDependencyMarket = {
                devTeam: pTeamCodeName,
                bot: botCodeName,
                botVersion: {
                    "major": 1,
                    "minor": 0
                },
                process: "Multi-Period-Market",
                dataSetVersion: "dataSet.V1"
            }
            parsedConfig.processes[0].statusDependencies.push(statusDependencyMarket)

            let statusDependencyDaily = {
                devTeam: pTeamCodeName,
                bot: botCodeName,
                botVersion: {
                    "major": 1,
                    "minor": 0
                },
                process: "Multi-Period-Daily",
                dataSetVersion: "dataSet.V1"
            }
            parsedConfig.processes[1].statusDependencies.push(statusDependencyDaily)

            //Changing Indicator Output
            parsedConfig.products[0].storageAccount = pTeamCodeName
            parsedConfig.products[0].dataSets[0].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Market/@Period"
            parsedConfig.products[0].dataSets[1].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Daily/@Period/@Year/@Month/@Day"
            parsedConfig.products[0].dataSets[1].dataRange.filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Daily"

            parsedConfig.products[1].storageAccount = pTeamCodeName
            parsedConfig.products[1].dataSets[0].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Market/@Period"
            parsedConfig.products[1].dataSets[1].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Daily/@Period/@Year/@Month/@Day"
            parsedConfig.products[1].dataSets[1].dataRange.filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Daily"

            // Write the new files
            let newSimulatorName = "simulator-" + pBotCodeName + "-Indicator-Bot"
            let newSimulatorPath = "bots/" + newSimulatorName
            await writeFileContent(pTeamCodeName, newSimulatorPath, "Commons.js", commons)
            await writeFileContent(pTeamCodeName, newSimulatorPath, "this.bot.config.json", beautify(parsedConfig, null, 2, 80))
            await writeFileContent(pTeamCodeName, newSimulatorPath + "/Multi-Period-Daily", "User.Bot.js", codeDaily)
            await writeFileContent(pTeamCodeName, newSimulatorPath + "/Multi-Period-Market", "User.Bot.js", codeMarket)

            logger.info('copySimulator completed for bot %s', pBotCodeName)

        } catch (err) {
            logger.error('copySimulator error for bot: %s, file: %s: %s', pBotCodeName, blobName, err)
            throw err
        }
    }

    async function removeSimulator(pTeamCodeName, pBotCodeName) {
        try {
            logger.info('removeSimulator started for bot %s', pBotCodeName)

            // Delete simulator code
            let newSimulatorName = "simulator-" + pBotCodeName + "-Indicator-Bot"
            let newSimulatorPath = "bots/" + newSimulatorName
            await deleteBlob(pTeamCodeName, newSimulatorPath, "Commons.js")
            await deleteBlob(pTeamCodeName, newSimulatorPath, "this.bot.config.json")
            await deleteBlob(pTeamCodeName, newSimulatorPath + "/Multi-Period-Daily", "User.Bot.js")
            await deleteBlob(pTeamCodeName, newSimulatorPath + "/Multi-Period-Market", "User.Bot.js")

            logger.info('removeSimulator completed for bot %s', pBotCodeName)

        } catch (err) {
            logger.error('copySimulator error for bot %s: %s', pBotCodeName, err)
            throw err
        }
    }

    async function getFileContent(containerName, blobName) {
        storage.readData[util.promisify.custom] = n => new Promise((resolve, reject) => {
            storage.readData("AATemplate", containerName, blobName, false, (err, pFileContent) => {
                resolve(pFileContent)
            })
        })

        let readData = util.promisify(storage.readData)
        let fileContent = await readData()
        return fileContent
    }

    async function writeFileContent(teamName, containerName, blobName, content) {
        storage.writeData[util.promisify.custom] = n => new Promise((resolve, reject) => {
            storage.writeData(teamName, containerName, blobName, content, (err, value) => {
                resolve()
            })
        })

        let writeData = util.promisify(storage.writeData)
        let response = await writeData()
        return response
    }

    async function deleteBlob(teamName, containerName, blobName) {
        try {
            storage.deleteBlob[util.promisify.custom] = n => new Promise((resolve, reject) => {
                storage.deleteBlob(teamName, containerName, blobName, (err, value) => {
                    resolve()
                })
            })

            let deleteBlob = util.promisify(storage.deleteBlob)
            let response = await deleteBlob()
            return response
        } catch (err) {
            logger.warn('Error deleting the file: %s%s', containerName, blobName)
        }
    }
}
