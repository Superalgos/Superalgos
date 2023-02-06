exports.newTestClientsManager = function newTestClientsManager(processIndex, networkCodeName) {
    /*
    This modules coordinates all Test Clients.
    */
    let thisObject = {
        onMessageReceived: onMessageReceived,
        initialize: initialize,
        finalize: finalize
    }

    let testClients

    return thisObject

    async function initialize() {

        await scanSuperalgosUserProfiles()
        SA.logger.info('Starting Network "' + networkCodeName + '" with these Test Clients:')
        console.table(testClients)

    }

    function finalize() {

    }

    async function scanSuperalgosUserProfiles() {
        testClients = []
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

                        for (let j = 0; j < network.testClientInstances.length; j++) {
                            let testClientInstance = network.testClientInstances[j]
                            testClientInstance.savedPayload = undefined
                            testClientInstance.userProfile = userProfile.name
                            testClients.push(testClientInstance)
                        }
                    }
                }
            }
        }
    }

    async function onMessageReceived(message, userProfile, instance) {
        const currentClientInstance = userProfile + ' / ' + instance
        switch (message.type) {
            case 'Get Next Test Case': {
                SA.logger.info(currentClientInstance, 'requested a new Test Case')
                let nextTestCase = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.getNextTestCase(currentClientInstance)
                if (nextTestCase === 'NO CASES FOR YOU') {
                    return 'ALREADY SENT YOU A CASE, WAIT 10 MINUTES TO ASK AGAIN'
                }
                if (nextTestCase === 'NO TEST CASES AVAILABLE AT THE MOMENT') {
                    return 'NO TEST CASES AVAILABLE AT THE MOMENT'
                }

                SA.logger.info('Test Case Id ' + nextTestCase.id + ' delivered to', currentClientInstance)
                nextTestCase.files.parameters = nextTestCase.files.parameters.toString()
                nextTestCase.files.timeSeries = nextTestCase.files.timeSeries.toString()
                nextTestCase.pythonScriptName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.pythonScriptName
                return nextTestCase

            }
            case 'Set Test Case Results': {
                TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.setTestCaseResults(JSON.parse(message.payload), currentClientInstance, userProfile)
                let response = JSON.stringify(TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getForecasts())
                return response
            }
        }
    }
}