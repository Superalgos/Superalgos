
// let financialBeingsCopy = newFinancialBeingClone()

// const simulatorTemplatePath = "aaplatform/AATemplate/bots/AAJason-Indicator-Bot1";
// const blobName = "this.bot.config.json";

// financialBeingsCopy.copySimulator("team-a", "team a", "matias", "bot-a", "bot a")
// async function copySimulator(pTeamCodeName, pTeamDisplayName, pUserName, pBotCodeName, pBotDisplayName, pUserId) {

const {
    Aborter,
    BlobURL,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential
} = require("@azure/storage-blob")

const beautify = require("json-beautify");

const { logger } = require('../logs/logger')

exports.newCopySimulator = function newCopySimulator() {

    let thisObject = {
        getFileContent: getFileContent,
        writeFileContent: writeFileContent,
        copySimulator: copySimulator,
        removeSimulator: removeSimulator
    }

    let serviceURL = getServiceURL();

    return thisObject;

    function getServiceURL() {
        // Enter your storage account name and shared key
        const account = process.env.STORAGE_BASE_URL;
        const accountKey = process.env.STORAGE_CONNECTION_STRING;

        // Use SharedKeyCredential with storage account and account key
        const sharedKeyCredential = new SharedKeyCredential(account, accountKey);

        // Use sharedKeyCredential, tokenCredential or anonymousCredential to create a pipeline
        const pipeline = StorageURL.newPipeline(sharedKeyCredential);

        // List containers
        const serviceURL = new ServiceURL(
            // When using AnonymousCredential, following url should include a valid SAS or support public access
            `https://${account}.blob.core.windows.net`,
            pipeline
        );
        logger.info("Connected to te file Storage.")
        return serviceURL
    }

    async function copySimulator(pTeamCodeName, pBotCodeName, pBotDisplayName) {
        try {
            logger.info('copySimulator started for bot %s', pBotCodeName)

            let templatePath = "aaplatform/AATemplate/bots/AAJason-Indicator-Bot"
            let commons = await getFileContent(templatePath, "Commons.js")
            let config = await getFileContent(templatePath, "this.bot.config.json")
            let codeDaily = await getFileContent(templatePath + "/Multi-Period-Daily", "User.Bot.js")
            let codeMarket = await getFileContent(templatePath + "/Multi-Period-Market", "User.Bot.js")

            // Change config to adapt the new indicator
            let parsedConfig = JSON.parse(config)
            parsedConfig.displayName = "Simulator " + pBotDisplayName;
            parsedConfig.codeName = "simulator-" + pBotCodeName;
            parsedConfig.devTeam = pTeamCodeName;
            parsedConfig.profilePicture = pBotCodeName + ".png";

            for (let i = 0; i < parsedConfig.processes[0].statusDependencies.length; i++) {

                if (parsedConfig.processes[0].statusDependencies[i].devTeam === "AAMasters" &&
                    parsedConfig.processes[0].statusDependencies[i].bot === "AAJason") {

                        parsedConfig.processes[0].statusDependencies[i].devTeam = parsedConfig.devTeam;
                        parsedConfig.processes[0].statusDependencies[i].bot = parsedConfig.codeName;
                }
            }

            for (let i = 0; i < parsedConfig.processes[1].statusDependencies.length; i++) {

                if (parsedConfig.processes[1].statusDependencies[i].devTeam === "AAMasters" &&
                    parsedConfig.processes[1].statusDependencies[i].bot === "AAJason") {

                        parsedConfig.processes[1].statusDependencies[i].devTeam = parsedConfig.devTeam;
                        parsedConfig.processes[1].statusDependencies[i].bot = parsedConfig.codeName;
                }
            }

            //Changing Indicator Output
            parsedConfig.products[0].storageAccount = pTeamCodeName
            parsedConfig.products[0].dataSets[0].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Market/@Period"
            parsedConfig.products[0].dataSets[1].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Market/@Period"
            parsedConfig.products[0].dataSets[1].dataRange.filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Trading-Simulation/Multi-Period-Market"

            parsedConfig.products[1].storageAccount = pTeamCodeName
            parsedConfig.products[1].dataSets[0].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Market/@Period"
            parsedConfig.products[1].dataSets[1].filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Market/@Period"
            parsedConfig.products[1].dataSets[1].dataRange.filePath = pTeamCodeName + "/" + parsedConfig.codeName + ".1.0/AACloud.1.1/@Exchange/dataSet.V1/Output/Simulation-Conditions/Multi-Period-Market"

            // Write the new files
            let newSimulatorName = pBotCodeName + "-Indicator-Bot"
            let newSimulatorPath = "aaplatform/"+ pTeamCodeName + "/bots/" + newSimulatorName
            await writeFileContent(newSimulatorPath, "Commons.js", commons)
            await writeFileContent(newSimulatorPath, "this.bot.config.json", beautify(parsedConfig, null, 2, 80))
            await writeFileContent(newSimulatorPath + "/Multi-Period-Daily", "User.Bot.js", codeDaily)
            await writeFileContent(newSimulatorPath + "/Multi-Period-Market", "User.Bot.js", codeMarket)

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
            let newSimulatorPath = "aaplatform/"+ pTeamCodeName + "/bots/" + newSimulatorName
            await deleteBlob(newSimulatorPath, "Commons.js")
            await deleteBlob(newSimulatorPath, "this.bot.config.json")
            await deleteBlob(newSimulatorPath + "/Multi-Period-Daily", "User.Bot.js")
            await deleteBlob(newSimulatorPath + "/Multi-Period-Market", "User.Bot.js")

            logger.info('removeSimulator completed for bot %s', pBotCodeName)

        } catch (err) {
            logger.error('copySimulator error for bot %s: %s', pBotCodeName, err)
            throw err
        }
    }

    async function getFileContent(containerName, blobName) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
        const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName)
        let downloadResponse = await blockBlobURL.download(Aborter.none, 0)
        return await streamToString(downloadResponse.readableStreamBody)
    }

    async function writeFileContent(containerName, blobName, content) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
        const blobURL = BlobURL.fromContainerURL(containerURL, blobName)
        const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL)
        await blockBlobURL.upload(
            Aborter.none,
            content,
            content.length
        )
    }

    async function deleteBlob(containerName, blobName) {
        try{
            const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
            const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName)
            await blockBlobURL.delete(Aborter.none)
        } catch (err) {
            logger.warn('Error deleting the file: %s%s', containerName, blobName)
        }
    }

    async function deleteContainer(containerName) {
        const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName)
        let containerRemoveResponse = await containerURL.delete(Aborter.none)
    }

    // A helper method used to read a Node.js readable stream into string
    async function streamToString(readableStream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", data => {
                chunks.push(data.toString());
            });
            readableStream.on("end", () => {
                resolve(chunks.join(""));
            });
            readableStream.on("error", reject)
        });
    }
}
