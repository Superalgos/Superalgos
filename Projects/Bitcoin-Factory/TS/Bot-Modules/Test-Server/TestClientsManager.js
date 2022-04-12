exports.newTestClientsManager = function newTestClientsManager(processIndex, networkCodeName) {
    /*
    This modules coordinates all Test Clients.
    */
    let thisObject = {
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    let testClients

    const WEBRTC_MODULE = require('./ML-Test-WebRTC/WebRTC')
    const WEBRTC_INSTANCES = []

    return thisObject

    async function initialize() {

        await scanSuperalgosUserProfiles()
        console.log((new Date()).toISOString(), 'Starting Network "' + networkCodeName + '" with these Test Clients:')
        console.table(testClients)

        for (let i = 0; i < testClients.length; i++) {
            let testClient = testClients[i]
            const WEBRTC = WEBRTC_MODULE.newMachineLearningWebRTC()
            WEBRTC.runningAtTestServer = true
            WEBRTC.clientInstanceName = testClient.name
            WEBRTC.userProfile = testClient.userProfile
            WEBRTC.initialize(testClient.id, i)
            WEBRTC_INSTANCES.push(WEBRTC)
        }
    }

    function finalize() {

    }

    function run() {
        for (let i = 0; i < WEBRTC_INSTANCES.length; i++) {
            let WEBRTC_INSTANCE = WEBRTC_INSTANCES[i]
            listenToTestClients(WEBRTC_INSTANCE)
        }
    }

    async function scanSuperalgosUserProfiles() {
        testClients = []
        let userProfileFIleList = await TEST_SERVER.utilities.getUserProfileFilesList()

        for (let i = 0; i < userProfileFIleList.length; i++) {
            let fileName = userProfileFIleList[i]
            await processUserProfile(fileName)
        }

        async function processUserProfile(fileName) {
            let userProfilePluginFile = await TEST_SERVER.utilities.getUserProfileFile(fileName)
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

    function listenToTestClients(WEBRTC) {
        WEBRTC.getNextMessage(onMessageReceived)

        function onMessageReceived(messageReceived) {
            let message = JSON.parse(messageReceived)

            switch (message.type) {
                case 'Get Next Test Case': {
                    let nextTestCase = TEST_SERVER.testCasesManager.getNextTestCase()
                    if (nextTestCase !== undefined) {
                        /*
                        Because there is a size limit at WebRTC for messages going through
                        data channels, we will need to split the content into different 
                        messages. One will have the nextTestCase object without the files,
                        and the other messages will be the timeseries and parameters files.
                        */
                        console.log((new Date()).toISOString(), WEBRTC.userProfile + ' / ' + WEBRTC.clientInstanceName, 'requested a new Test Case')
                        WEBRTC.sendResponse('SENDING MULTIPLE MESSAGES')
                        WEBRTC.sendFile(nextTestCase.files.timeSeries)
                        WEBRTC.sendFile(nextTestCase.files.parameters)
                        nextTestCase.files.timeSeries = undefined
                        nextTestCase.files.parameters = undefined
                        WEBRTC.sendResponse(JSON.stringify(nextTestCase))
                        WEBRTC.sendResponse('MULTIPLE MESSAGES SENT')
                        console.log((new Date()).toISOString(), 'Test Case Id ' + nextTestCase.id + ' delivered to', WEBRTC.userProfile + ' / ' + WEBRTC.clientInstanceName)
                    } else {
                        console.log((new Date()).toISOString(), 'No more Test Cases. Could not deliver one to ' + WEBRTC.userProfile + ' / ' + WEBRTC.clientInstanceName)
                        WEBRTC.sendResponse('NO TEST CASES AVAILABLE AT THE MOMENT')
                    }
                    break
                }
                case 'Set Test Case Results': {
                    TEST_SERVER.testCasesManager.setTestCaseResults(JSON.parse(message.payload), WEBRTC.userProfile + ' / ' + WEBRTC.clientInstanceName)
                    let response = JSON.stringify(TEST_SERVER.forecastCasesManager.getForecasts())
                    WEBRTC.sendResponse(response)
                    break
                }
            }
        }
    }
}