exports.newForecastClientsManager = function newForecastClientsManager(processIndex, networkCodeName) {
    /*
    This modules coordinates all Forecast Clients.
    */
    let thisObject = {
        onMessageReceived: onMessageReceived,
        initialize: initialize,
        finalize: finalize
    }

    let forecastClients

    return thisObject

    async function initialize() {

        await scanSuperalgosUserProfiles()
        SA.logger.info('Starting Network "' + networkCodeName + '" with these Forecast Clients:')
        console.table(forecastClients)

    }

    function finalize() {

    }

    async function scanSuperalgosUserProfiles() {
        forecastClients = []
        let userProfileFIleList = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getUserProfileFilesList()

        for (let i = 0; i < userProfileFIleList.length; i++) {
            let fileName = userProfileFIleList[i]
            await processUserProfile(fileName)
        }

        async function processUserProfile(fileName) {
            let userProfilePluginFile = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.utilities.getUserProfileFile(fileName)
            let userProfile = JSON.parse(userProfilePluginFile)
            if (
                userProfile.forecastsProviders !== undefined &&
                userProfile.forecastsProviders.bitcoinFactoryForecasts !== undefined
            ) {

                for (let i = 0; i < userProfile.forecastsProviders.bitcoinFactoryForecasts.length; i++) {
                    let network = userProfile.forecastsProviders.bitcoinFactoryForecasts[i]
                    if (network.name === networkCodeName) {

                        for (let j = 0; j < network.forecastClientInstances.length; j++) {
                            let forecastClientInstance = network.forecastClientInstances[j]
                            forecastClientInstance.savedPayload = undefined
                            forecastClientInstance.userProfile = userProfile.name
                            forecastClients.push(forecastClientInstance)
                        }
                    }
                }
            }
        }
    }

    async function onMessageReceived(message, userProfile, instance) {
        const currentClientInstance = userProfile + ' / ' + instance
        // check for mixed up messages
        // only if message.type == Get Next Forecast Case || == Get All Forecast Cases => no test server is okay
        if ((message.testServer != undefined) && (message.testServer.instance != undefined) && ((message.type != 'Get Next Forecast Case') && (message.type != 'Get All Forecast Cases'))) {
            if (message.testServer.instance != TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName) {
                SA.logger.error('We did receive a message from ' + currentClientInstance + ', which asked for testserver '+message.testServer.instance+', but I am '+TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName+'. Write a bug report.')
                return 'WRONG TESTSERVER! I AM:'+TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName
            }
        } else if ((message.type!='Get Next Forecast Case') && (message.type != 'Get All Forecast Cases')) {
            SA.logger.error('We did receive a message from ' + currentClientInstance + ', which has no target testserver. Write a bug report.')
            return 'NO TESTSERVER! I AM:'+TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.serverInstanceName
        }
        switch (message.type) {
            case 'Get Next Forecast Case': {
                SA.logger.info(currentClientInstance, 'requested a new Forecast Case')
                let nextForecastCase = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getNextForecastCase(currentClientInstance)
                if (nextForecastCase !== undefined) {
                    SA.logger.info('Forecast Case Id ' + nextForecastCase.id + ' delivered to', currentClientInstance)
                    nextForecastCase.files.parameters = nextForecastCase.files.parameters.toString()
                    nextForecastCase.files.timeSeries = nextForecastCase.files.timeSeries.toString()
                    if (nextForecastCase.pythonScriptName == undefined) nextForecastCase.pythonScriptName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.pythonScriptName
                    return nextForecastCase
                } else {
                    SA.logger.info('No more Forecast Cases to Build. Could not deliver one to ' + currentClientInstance)
                    return'NO FORECAST CASES AVAILABLE AT THE MOMENT'
                }
            }
            case 'Get This Forecast Case': {
                SA.logger.info(currentClientInstance, 'requested the Forecast Case Id ' + message.forecastCaseId)
                let thisForecastCase = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getThisForecastCase(message.forecastCaseId)
                if (thisForecastCase !== undefined) {
                    SA.logger.info('Forecast Case Id ' + thisForecastCase.id + ' delivered to', currentClientInstance)
                    thisForecastCase.files.parameters = thisForecastCase.files.parameters.toString()
                    thisForecastCase.files.timeSeries = thisForecastCase.files.timeSeries.toString()
                    return thisForecastCase
                } else {
                    SA.logger.info('Forecast Case ' + message.forecastCaseId + ' is Not Available Anymore. Could not deliver requested Case to ' + currentClientInstance)
                    return'THIS FORECAST CASE IS NOT AVAILABLE ANYMORE'
                }
            }
            case 'Set Forecast Case Results': {
                TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.setForecastCaseResults(JSON.parse(message.payload), currentClientInstance)
                let response = JSON.stringify(TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getForecasts())
                return response
            }
            case 'Get All Forecast Cases': {
                SA.logger.info(currentClientInstance, 'requested all Forecast Cases')
                let response = JSON.stringify(TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getForecasts())
                return response
            }
        }
    }
}