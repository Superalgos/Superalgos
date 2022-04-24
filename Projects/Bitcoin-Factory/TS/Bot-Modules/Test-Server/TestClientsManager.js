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
        console.log((new Date()).toISOString(), 'Starting Network "' + networkCodeName + '" with these Test Clients:')
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

    async function onMessageReceived(message, userProfile, clientInstanceName) {
        const currentClientInstance = userProfile + ' / ' + clientInstanceName
        switch (message.type) {
            case 'Get Next Test Case': {
                console.log((new Date()).toISOString(), currentClientInstance, 'requested a new Test Case')
                let nextTestCase = await TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.getNextTestCase(currentClientInstance)
                if (nextTestCase !== undefined) {
                    console.log((new Date()).toISOString(), 'Test Case Id ' + nextTestCase.id + ' delivered to', currentClientInstance)
                    nextTestCase.files.parameters = nextTestCase.files.parameters.toString()
                    nextTestCase.files.timeSeries = nextTestCase.files.timeSeries.toString()
                    return nextTestCase
                } else {
                    console.log((new Date()).toISOString(), 'No more Test Cases. Could not deliver one to ' + currentClientInstance)
                    return 'NO TEST CASES AVAILABLE AT THE MOMENT'
                }
            }
            case 'Set Test Case Results': {
                TS.projects.foundations.globals.taskConstants.TEST_SERVER.testCasesManager.setTestCaseResults(JSON.parse(message.payload), currentClientInstance)
                let response = JSON.stringify(TS.projects.foundations.globals.taskConstants.TEST_SERVER.forecastCasesManager.getForecasts())
                return response
            }
        }
    }
}